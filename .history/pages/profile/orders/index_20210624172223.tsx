import UserName from "@components_new/profile/UserName";
import React, { memo, FC } from "react";
import { Layout } from '@components/common'

const OrdersPage = () => {
    return (
      <div>
        <UserName />
      </div>
    )
}

OrdersPage.Layout = Layout

export default memo(OrdersPage)