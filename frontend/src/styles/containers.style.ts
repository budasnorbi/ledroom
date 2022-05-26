import { css } from "@emotion/react"

export const bodyContainer = css`
  body {
    margin: 0;
    padding: 0;
    background-color: black;
    width: 100vw;
    height: 100vh;
  }
  #root {
    display: grid;
    grid-template-rows: [wavesurferContainerStart] 148px [controlContainerStart] 50px [restStart] 1fr;
    grid-template-columns: [regionsContainerStart] 25% [previewContainerStart] 75%;
  }
`

export const rootContainer = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 10px;
  top: 10px;
  /* width: calc(100% - 20px);
  height: calc(100% - 20px); */
  z-index: 1;
`
export const editorContainer = css`
  //height: 100%;
`

export const regionsContainer = css`
  border: solid 1px red;
  grid-column: regionsContainerStart / previewContainerStart;
  grid-row: restStart / -1;
`

export const previewContainer = css`
  border: solid 1px white;
  grid-column: previewContainerStart / -1;
  grid-row: restStart / -1;
`

export const wavesurferContainer = css`
  grid-column: 1 / -1;
  grid-row: wavesurferContainerStart / controlContainerStart;
`

export const controlContainer = css`
  grid-column: previewContainerStart / -1;
  grid-row: controlContainerStart / restStart;
`
