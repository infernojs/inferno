// User-level hardware counter helper for the bench runner.
//
// Opens one perf_event group per thread (user space only, so it works at
// perf_event_paranoid=2 on our own processes) and is driven over stdin with
// one command per line; every command answers with one JSON line:
//
//   open <tid> [<tid>...]   open a counter group on each thread
//   enable | disable        start/stop all groups (ioctl on the leaders)
//   reset                   zero all counters
//   read                    {"threads":[{"tid":..,"enabled":ns,"running":ns,"counts":[..]}]}
//   close                   close every group
//   quit
//
// Groups hold at most 5 events: Zen 3 has 6 general counters and the NMI
// watchdog keeps one. "running < enabled" in a read means the group was
// multiplexed and the counts are not exact.
#define _GNU_SOURCE
#include <errno.h>
#include <linux/perf_event.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ioctl.h>
#include <sys/syscall.h>
#include <unistd.h>

#define MAX_THREADS 64
#define NUM_EVENTS 5

static const char *EVENT_NAMES[NUM_EVENTS] = {
    "instructions", "cycles", "branch-misses", "L1-dcache-load-misses", "stalled-cycles-frontend",
};

struct group {
  int tid;
  int fds[NUM_EVENTS];
  int nopen;
};

static struct group groups[MAX_THREADS];
static int ngroups = 0;

static void event_attr(int i, struct perf_event_attr *pe) {
  memset(pe, 0, sizeof(*pe));
  pe->size = sizeof(*pe);
  pe->exclude_kernel = 1;
  pe->exclude_hv = 1;
  pe->read_format = PERF_FORMAT_GROUP | PERF_FORMAT_TOTAL_TIME_ENABLED | PERF_FORMAT_TOTAL_TIME_RUNNING;
  pe->type = PERF_TYPE_HARDWARE;
  switch (i) {
    case 0:
      pe->config = PERF_COUNT_HW_INSTRUCTIONS;
      break;
    case 1:
      pe->config = PERF_COUNT_HW_CPU_CYCLES;
      break;
    case 2:
      pe->config = PERF_COUNT_HW_BRANCH_MISSES;
      break;
    case 3:
      pe->type = PERF_TYPE_HW_CACHE;
      pe->config = PERF_COUNT_HW_CACHE_L1D | (PERF_COUNT_HW_CACHE_OP_READ << 8) | (PERF_COUNT_HW_CACHE_RESULT_MISS << 16);
      break;
    case 4:
      pe->config = PERF_COUNT_HW_STALLED_CYCLES_FRONTEND;
      break;
  }
}

static int open_group(int tid, struct group *g, char *err, size_t errlen) {
  g->tid = tid;
  g->nopen = 0;
  for (int i = 0; i < NUM_EVENTS; i++) {
    struct perf_event_attr pe;
    event_attr(i, &pe);
    pe.disabled = i == 0;  // only the leader starts disabled
    int leader = i == 0 ? -1 : g->fds[0];
    int fd = (int)syscall(__NR_perf_event_open, &pe, tid, -1, leader, 0);
    if (fd < 0) {
      snprintf(err, errlen, "perf_event_open(%s, tid %d): %s", EVENT_NAMES[i], tid, strerror(errno));
      for (int j = 0; j < g->nopen; j++) {
        close(g->fds[j]);
      }
      g->nopen = 0;
      return -1;
    }
    g->fds[i] = fd;
    g->nopen++;
  }
  return 0;
}

static void json_error(const char *msg) {
  printf("{\"error\":\"");
  for (const char *p = msg; *p; p++) {
    if (*p == '"' || *p == '\\') {
      putchar('\\');
    }
    putchar(*p);
  }
  printf("\"}\n");
}

static void cmd_read(void) {
  printf("{\"events\":[");
  for (int i = 0; i < NUM_EVENTS; i++) {
    printf("%s\"%s\"", i ? "," : "", EVENT_NAMES[i]);
  }
  printf("],\"threads\":[");
  for (int g = 0; g < ngroups; g++) {
    uint64_t buf[3 + NUM_EVENTS];
    ssize_t n = read(groups[g].fds[0], buf, sizeof(buf));
    printf("%s{\"tid\":%d", g ? "," : "", groups[g].tid);
    if (n < (ssize_t)(3 * sizeof(uint64_t))) {
      printf(",\"error\":\"read failed\"}");
      continue;
    }
    uint64_t nr = buf[0];
    printf(",\"enabled\":%llu,\"running\":%llu,\"counts\":[", (unsigned long long)buf[1], (unsigned long long)buf[2]);
    for (uint64_t i = 0; i < nr && i < NUM_EVENTS; i++) {
      printf("%s%llu", i ? "," : "", (unsigned long long)buf[3 + i]);
    }
    printf("]}");
  }
  printf("]}\n");
}

static void ioctl_all(unsigned long req) {
  for (int g = 0; g < ngroups; g++) {
    ioctl(groups[g].fds[0], req, PERF_IOC_FLAG_GROUP);
  }
}

static void close_all(void) {
  for (int g = 0; g < ngroups; g++) {
    for (int i = 0; i < groups[g].nopen; i++) {
      close(groups[g].fds[i]);
    }
  }
  ngroups = 0;
}

int main(void) {
  char line[4096];
  setvbuf(stdout, NULL, _IOLBF, 0);
  while (fgets(line, sizeof(line), stdin)) {
    line[strcspn(line, "\r\n")] = 0;
    if (strncmp(line, "open", 4) == 0) {
      char err[256] = {0};
      int ok = 1;
      for (char *tok = strtok(line + 4, " "); tok; tok = strtok(NULL, " ")) {
        if (ngroups >= MAX_THREADS) {
          snprintf(err, sizeof(err), "too many threads");
          ok = 0;
          break;
        }
        if (open_group(atoi(tok), &groups[ngroups], err, sizeof(err)) == 0) {
          ngroups++;
        } else {
          ok = 0;
          break;
        }
      }
      if (ok) {
        printf("{\"ok\":true,\"groups\":%d}\n", ngroups);
      } else {
        json_error(err);
      }
    } else if (strcmp(line, "enable") == 0) {
      ioctl_all(PERF_EVENT_IOC_ENABLE);
      printf("{\"ok\":true}\n");
    } else if (strcmp(line, "disable") == 0) {
      ioctl_all(PERF_EVENT_IOC_DISABLE);
      printf("{\"ok\":true}\n");
    } else if (strcmp(line, "reset") == 0) {
      ioctl_all(PERF_EVENT_IOC_RESET);
      printf("{\"ok\":true}\n");
    } else if (strcmp(line, "read") == 0) {
      cmd_read();
    } else if (strcmp(line, "close") == 0) {
      close_all();
      printf("{\"ok\":true}\n");
    } else if (strcmp(line, "quit") == 0) {
      close_all();
      printf("{\"ok\":true}\n");
      return 0;
    } else {
      json_error("unknown command");
    }
  }
  close_all();
  return 0;
}
