import React, { FC, memo } from 'react'
import PropTypes from 'prop-types'
import TextProductOption from './TextProductOption'
import get from 'lodash/get'


function withDefaultHandler(handler, defaultHandler) {
  return (e, ...args) => {
    if (handler) {
      handler(e, ...args)
    }

    if (!e.defaultPrevented) {
      defaultHandler(e, ...args)
    }
  }
}

type ProductOptionProp = {
  value: Object,
  selected?: boolean,
  selectedOption?: Object,
  onSelectedOptionChange?: Function,
  onClick?: Function,
  variant?: string,
  showLabel?: boolean,
  wrapperProps?: Function,
  optionProps?: Function,
  selectedClassName?: string
}

const ProductOption: FC<ProductOptionProp> = ({
  value,
  selected,
  selectedOption,
  onSelectedOptionChange,
  onClick,
  variant,
  showLabel = true,
  wrapperProps,
  optionProps,
  selectedClassName = 'rsf-po-selected',
  ...others as props
}) => {

  if (selectedOption) {
    selected = get(value, 'id') == get(selectedOption, 'id')
  }

  const handleClick = withDefaultHandler(onClick, (_e) => {
    if (onSelectedOptionChange) {
      onSelectedOptionChange(selected ? null : value)
    }
  })

  const Variant = TextProductOption
  const propArgs = { selected, ...props }

  return (
    <div
      className={`w-full text-center cursor-pointer rounded-2xl outline-none ${
        selected ? 'bg-gray-300' : ''
      }`}
      {...wrapperProps(propArgs)}
      onClick={handleClick}
    >
      <Variant
        {...others}
        {...optionProps(propArgs)}
        label={showLabel ? value && value.text : undefined}
        selected={selected}
        onClick={handleClick}
        disabled={get(value, 'disabled')}
      />
    </div>
  )
}

ProductOption.propTypes = {
  /**
   * The UI variant that controls how the option is displayed.
   */
  variant: PropTypes.oneOf(['text', 'swatch']).isRequired,
  /**
   * Set to `false` to hide the label text.
   */
  showLabel: PropTypes.bool,
  /**
   * The CSS class name applied to a selected option.
   */
  selectedClassName: PropTypes.string,
  /**
   * The value for the product option.
   */
  value: PropTypes.object,
  /**
   * If `true`, this option is the selected option.
   */
  selected: PropTypes.bool,
  /**
   * An alternative to using [`selected`](#prop-selected), this is a value that will be tested against
   * the [`value`](#prop-value) prop to determine if this option is selected.
   */
  selectedOption: PropTypes.object,
  /**
   * Called when the selected option is changed.
   */
  onSelectedOptionChange: PropTypes.func,
  /**
   * Called with this option is clicked.
   */
  onClick: PropTypes.func,
  /**
   * A function that returns props to pass to the wrapper element.
   */
  wrapperProps: PropTypes.func,
  /**
   * A function that returns props to pass to the option element.
   */
  optionProps: PropTypes.func,
}

ProductOption.defaultProps = {
  showLabel: true,
  wrapperProps: Function.prototype,
  optionProps: Function.prototype,
  selectedClassName: 'rsf-po-selected',
}
