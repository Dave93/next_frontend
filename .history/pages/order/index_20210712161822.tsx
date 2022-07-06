import { Layout } from '@components/common'
import Contact from '@components_new/order/Contact'
import Orders from '@components_new/order/Orders'

export default function Order() {
  return (
    <div>
      <Orders setOpen={false} />
    </div>
  )
}

Order.Layout = Layout
