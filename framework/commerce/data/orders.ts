export type OrderItem = {
  img: string
  name: string
  type: string
  price: string
}

export type Orders = {
  id: number
  date: string
  address: string
  productCount: string
  totalPrice: string
  statusCode: string
  items: OrderItem[]
}

const orderItems: Orders[] = [
  {
    id: 433,
    date: '26 май 2021 г. 19: 11',
    address: 'ул., Буюк Ипак Йули, Дом 95а, кв 31',
    productCount: '3 товара',
    totalPrice: '108 000 сум',
    statusCode: 'order_delivered',
    items: [
      {
        img: '/pizza_img.png',
        name: 'Пепперони',
        type: 'Средняя 32 см, Традиционное тесто',
        price: '108 000 сум',
      },
      {
        img: '/pizza_img.png',
        name: 'Байрам',
        type: 'Средняя 32 см, Традиционное тесто',
        price: '88 000 сум',
      },
    ],
  },

  {
    id: 444,
    date: '26 май 2021 г. 19: 11',
    address: 'ул., Буюк Ипак Йули, Дом 95а, кв 31',
    productCount: '3 товара',
    totalPrice: '88 000 сум',
    statusCode: 'order_cancelled',
    items: [
      {
        img: '/pizza_img.png',
        name: 'Байрам',
        type: 'Средняя 32 см, Традиционное тесто',
        price: '108 000 сум',
      },
    ],
  },
]

export default orderItems
