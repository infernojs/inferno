export component MultiTop() {
  <>
    <p class='one'>{text '1'}</p>
    <p class='two'>{text '2'}</p>
    <p class='three'>{text '3'}</p>
  </>
}

export component Mixed() {
  <div>
    <>
      <span class='a'>{text 'A'}</span>
      <span class='b'>{text 'B'}</span>
    </>
  </div>
}

export component Nested() {
  <>
    <>
      <p class='x'>{text 'x'}</p>
      <p class='y'>{text 'y'}</p>
    </>
    <p class='z'>{text 'z'}</p>
  </>
}
