import React, { memo } from 'react'
function ProductListSectionTitle({ title }) {
  return <h3 className="border-b-4 border-yellow py-1 text-3xl w-max mb-10">{title}</h3>
}

ProductListSectionTitle.defaultProps = {
  title: '',
}

export default memo(ProductListSectionTitle)
