import React from 'react';
import DaumPostcode from "react-daum-postcode";

const SearchAddressPopUp = (props:{ setAddress:any; setOpenSearchAddr:any;}) => {

    const {setAddress, setOpenSearchAddr} = props;

    // 우편번호 검색 후 주소 클릭 시 실행될 함수, data callback 용
    const handlePostCode = (data: { address: any; addressType: string; bname: string; buildingName: string; zonecode: any; }) => {
        setAddress(data);
        setOpenSearchAddr(false);
    }

    return (
        <>
            <section>
                <DaumPostcode style={{
                    top: "10%",
                    width: "450px",
                    height: "550px",
                    padding: "7px"}}
                    onComplete={handlePostCode}/>
            </section>
        </>
    );
}

export default SearchAddressPopUp;
