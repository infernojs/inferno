export function MultiTop() @{
  <>
    <p class='one'>{'1'}</p>
    <p class='two'>{'2'}</p>
    <p class='three'>{'3'}</p>
  </>
}

export function Mixed() @{
  <div>
    <>
      <span class='a'>{'A'}</span>
      <span class='b'>{'B'}</span>
    </>
  </div>
}

export function Nested() @{
  <>
    <>
      <p class='x'>{'x'}</p>
      <p class='y'>{'y'}</p>
    </>
    <p class='z'>{'z'}</p>
  </>
}
