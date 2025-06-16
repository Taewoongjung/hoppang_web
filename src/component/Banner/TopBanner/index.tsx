import React from 'react';
import { Carousel } from 'antd';

const TopBanner = () => {

    return (
        <>
            <Carousel
                autoplay={{ dotDuration: true }}
                autoplaySpeed={5000}
                style={{ width: '100%', height: '100%' }}
            >
                <div>
                    <div style={{ width: '100%', height: '100%' }}>
                        <img src="/assets/Banner/1.hyundai_sale.png" alt="hyndai sale"
                             style={{ width: '100%', height: 'auto', objectFit: 'cover' }}/>
                    </div>
                </div>
                <div>
                    <div style={{ width: '100%', height: '100%' }}>
                        <img src="/assets/Banner/2.lx_kcc_sale.png" alt="lxx kcc sale"
                             style={{ width: '100%', height: 'auto', objectFit: 'cover' }}/>
                    </div>
                </div>
            </Carousel>
        </>
    )
}

export default TopBanner;
