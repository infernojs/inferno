function ProbeTry(props) @{
  <>
    @try {
      <span>{'ok'}</span>
    } @catch (err) {
      <span>{err.message}</span>
    } @pending {
      <span>{'loading'}</span>
    }
  </>
}
