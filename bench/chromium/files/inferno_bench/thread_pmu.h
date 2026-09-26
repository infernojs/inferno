// Per-thread hardware counters for Inferno benchmarking. Maintained in the
// inferno repository (bench/chromium); only compiled into out dirs with
// inferno_bench = true.
//
// One counter group per thread (user space only), opened lazily on first use
// and shared by every consumer in the binary (perfetto trace events and V8's
// infernoBenchCounters()), so the PMU is never oversubscribed by us.
// perf_event_open is blocked by the renderer sandbox: run with --no-sandbox.

#ifndef INFERNO_BENCH_THREAD_PMU_H_
#define INFERNO_BENCH_THREAD_PMU_H_

#include <linux/perf_event.h>
#include <sys/syscall.h>
#include <unistd.h>

#include <cstdint>
#include <cstdlib>
#include <cstring>

namespace inferno_bench {

// instructions, cycles, branch-misses, L1D read misses. Four events plus the
// NMI watchdog fit Zen 3's six counters without multiplexing.
inline constexpr int kNumCounters = 4;

// Runtime gate: INFERNO_BENCH_PMU=1 in the browser environment (inherited by
// child processes).
inline bool Enabled() {
  static const bool enabled = [] {
    const char* v = std::getenv("INFERNO_BENCH_PMU");
    return v != nullptr && v[0] == '1';
  }();
  return enabled;
}

class ThreadCounters {
 public:
  ~ThreadCounters() { Close(); }

  // Absolute user-space counts of the calling thread since the group opened.
  // Returns false when counters are unavailable (sandbox, paranoid level).
  bool Read(uint64_t out[kNumCounters]) {
    if (state_ == kUnopened) {
      state_ = Open() ? kOpen : kFailed;
    }
    if (state_ != kOpen) {
      return false;
    }
    uint64_t buf[1 + kNumCounters];
    ssize_t n = read(fds_[0], buf, sizeof(buf));
    if (n != static_cast<ssize_t>(sizeof(buf)) || buf[0] != kNumCounters) {
      return false;
    }
    for (int i = 0; i < kNumCounters; i++) {
      out[i] = buf[1 + i];
    }
    return true;
  }

 private:
  enum State { kUnopened, kOpen, kFailed };

  bool Open() {
    static constexpr uint64_t kEvents[kNumCounters][2] = {
        {PERF_TYPE_HARDWARE, PERF_COUNT_HW_INSTRUCTIONS},
        {PERF_TYPE_HARDWARE, PERF_COUNT_HW_CPU_CYCLES},
        {PERF_TYPE_HARDWARE, PERF_COUNT_HW_BRANCH_MISSES},
        {PERF_TYPE_HW_CACHE,
         PERF_COUNT_HW_CACHE_L1D | (PERF_COUNT_HW_CACHE_OP_READ << 8) |
             (PERF_COUNT_HW_CACHE_RESULT_MISS << 16)},
    };
    for (int i = 0; i < kNumCounters; i++) {
      perf_event_attr attr;
      std::memset(&attr, 0, sizeof(attr));
      attr.size = sizeof(attr);
      attr.type = static_cast<uint32_t>(kEvents[i][0]);
      attr.config = kEvents[i][1];
      attr.exclude_kernel = 1;
      attr.exclude_hv = 1;
      attr.read_format = PERF_FORMAT_GROUP;
      int leader = i == 0 ? -1 : fds_[0];
      fds_[i] = static_cast<int>(
          syscall(__NR_perf_event_open, &attr, 0, -1, leader, 0));
      if (fds_[i] < 0) {
        Close();
        return false;
      }
    }
    return true;
  }

  void Close() {
    for (int& fd : fds_) {
      if (fd >= 0) {
        close(fd);
      }
      fd = -1;
    }
  }

  State state_ = kUnopened;
  int fds_[kNumCounters] = {-1, -1, -1, -1};
};

inline ThreadCounters& Current() {
  thread_local ThreadCounters counters;
  return counters;
}

}  // namespace inferno_bench

#endif  // INFERNO_BENCH_THREAD_PMU_H_
