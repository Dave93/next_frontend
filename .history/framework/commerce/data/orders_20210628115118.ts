export type Orders = {
  id: number
  date: string
  address: string
  productCount: string
  price: string
  statusCode: string
  img: string
}

const orderItems: Orders[] = [
  {
    id: 433,
    date: '26 май 2021 г. 19: 11',
    address: 'ул., Буюк Ипак Йули, Дом 95а, кв 31',
    productCount: '3 товара',
    price: '108 000 сум',
    statusCode: 'order_delivered',
    img: '/pizza_img.png',
  },

  {
    id: 444,
    date: '26 май 2021 г. 19: 11',
    address: 'ул., Буюк Ипак Йули, Дом 95а, кв 31',
    productCount: '3 товара',
    price: '88 000 сум',
    statusCode: 'order_cancelled',
    img: '/pizza_img.png',
  },
]

export default orderItems
