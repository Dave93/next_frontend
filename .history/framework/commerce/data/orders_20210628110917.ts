export type Orders = {
  id: number
  date: string
  address: string
  product: string
  price: string
  statusCode: string
}

const orderItems: Orders[] = [
  {
    id: 433,
    date: '26 май 2021 г. 19: 11',
    address: 'ул., Буюк Ипак Йули, Дом 95а, кв 31',
    product: '3 товара',
    price: '108 000 сум',
    statusCode: 'order_delivered',
  },

  {
    id: 433,
    date: '26 май 2021 г. 19: 11',
    address: 'ул., Буюк Ипак Йули, Дом 95а, кв 31',
    product: '3 товара',
    price: '108 000 сум',
    statusCode: 'order_cancelled',
  },
]

export default orderItems
