import {FloatButton} from "antd";
import React from "react";

export const GoToTopButton = () => {

    return (
        <>
            <FloatButton.Group shape="circle">
                <FloatButton.BackTop visibilityHeight={0} />
            </FloatButton.Group>
        </>
    )
}
