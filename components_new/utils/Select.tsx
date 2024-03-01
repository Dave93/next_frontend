import React, { FC, memo } from 'react'
import { useSelect } from 'downshift'
import { ChevronDownIcon } from '@heroicons/react/solid'

interface SelectItem {
  value: string
  label: string
}

interface SelectProps {
  items: SelectItem[]
  onChange: any
  placeholder: string
  className?: string
}

const Select: FC<SelectProps> = ({
  items,
  onChange,
  placeholder,
  className,
}) => {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    items,
    onSelectedItemChange: ({ selectedItem }) => onChange(selectedItem?.value),
  })
  return (
    <div className={`relative ${className || ''}`}>
      <button
        type="button"
        {...getToggleButtonProps()}
        className="pl-7 pr-5 py-3 flex justify-between md:w-44 bg-gray-100 text-gray-400 rounded-full items-center"
      >
        <span>{selectedItem?.label || placeholder}</span>
        <ChevronDownIcon className="h-8 w-8" />
      </button>
      <ul
        {...getMenuProps()}
        className="absolute bg-gray-100 md:w-44 w-full shadow-md z-40 rounded-b-md overflow-hidden max-h-28 overflow-y-auto"
      >
        {isOpen &&
          items.map((item, index) => (
            <li
              key={`${item.label}${index}`}
              {...getItemProps({ item, index })}
              className={`cursor-pointer px-3 py-2 text-gray-400 ${
                highlightedIndex === index ? 'bg-gray-200' : 'bg-gray-100'
              }`}
            >
              {item.label}
            </li>
          ))}
      </ul>
    </div>
  )
}

export default Select
