export const doc = ID => {
  if (document.getElementById(ID) !== null) {
    return document.getElementById(ID)
  } else if (ID[0] === '~') {
    return document.querySelector(ID.substring(1))
  } else {
    if (!ID) {
      console.error(`
      The ID value is empty for doc().
      Check if the element has an ID`)
    } else {
      console.error(`Could not find id (id: ${ID}).\nAttempting to return ID`)
      return ID
    }
  }
}

export const jInsert = (ID, html, options = {}) => {
  const { refresh = false } = options
  const newDoc = new DOMParser().parseFromString(html.substring(1), 'text/html')
  const newNodes = Array.from(newDoc.body.childNodes)
  const parent = doc(ID)

  if (refresh) {
    delChildren(ID)
  }

  newNodes.forEach(node => {
    parent.appendChild(node.cloneNode(true))
  })
  return newNodes[0].id
}

export const btnClick = (ID, fn) => {
  return doc(ID).addEventListener('click', fn)
}
