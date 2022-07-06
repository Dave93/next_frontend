import UserName from "@components_new/profile/UserName";
import React, { memo, FC } from "react";

const OrdersPage: FC = () => {
    return (
      <div>
        <UserName />
      </div>
    )
}

export default memo(OrdersPage)