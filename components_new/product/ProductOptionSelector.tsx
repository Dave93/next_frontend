import { ProductOption, ProductOptionValues } from '@commerce/types/product'
import { FC, memo } from 'react'
import styles from './ProductOptionSelector.module.css'

type ProductOptionSelectorProps = {
  option: ProductOption
  onChange: Function
}

const ProductOptionSelect: FC<ProductOptionSelectorProps> = ({
  option,
  onChange,
}) => {
  return (
    <div className={styles.productSelectorOption}>
      {option.values.map((v: ProductOptionValues) => (
        <div
          className={`w-full text-center cursor-pointer rounded-2xl outline-none ${
            v.active ? 'bg-gray-300' : ''
          }`}
          onClick={() => onChange(option.id, v.id)}
          key={v.id}
        >
          <button className="outline-none focus:outline-none text-xs py-2">
            {v.label}
          </button>
        </div>
      ))}
    </div>
  )
}

export default memo(ProductOptionSelect)
