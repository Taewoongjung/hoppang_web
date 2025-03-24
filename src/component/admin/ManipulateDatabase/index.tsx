import React, { useEffect, useState } from 'react';
import {
    Table,
    Tabs,
    theme,
    TableProps,
    Select,
    Result,
    Divider
} from "antd";
import axios from "axios";
import chassisType from "../../../definition/chassisType";
import {mappedValueByCompany, addCommasToNumber} from "../../../util";
import {findAllChassisPriceByCompanyTypeAndChassisType} from "../../../definition/Admin/apiPath";
import {HYUNDAI_ko, KCC_GLASS_ko, LX_ko} from "../../../definition/companyType";
import AddAndReviseChassisInfo from "./AddAndReviseChassisInfo";
import AdditionalChassisPriceCriteria from "./AdditionalChassisPriceCriteria";

type TransformedData = Record<string, string>;

interface TableData {
    key:string,
    rowLabel:string
}

const defaultDataSource = {
    '300': '',
    '600': '',
    '900': '',
    '1200': '',
    '1500': '',
    '1800': '',
    '2100': '',
    '2400': '',
    '2700': '',
    '3000': '',
    '3300': '',
    '3600': '',
    '3900': '',
    '4200': '',
    '4500': '',
    '4800': '',
    '5100': '',
    '5400': ''
};


const ManipulateDatabase = () => {

    const tabList = ['현대 L&C', 'LX 하우시스', 'KCC 글라스'];

    const [curCompanyType, setCurCompanyType] = useState('현대 L&C');

    const [row300, setRow300] = useState<TransformedData>({});
    const [row600, setRow600] = useState<TransformedData>({});
    const [row900, setRow900] = useState<TransformedData>({});
    const [row1200, setRow1200] = useState<TransformedData>({});
    const [row1500, setRow1500] = useState<TransformedData>({});
    const [row1800, setRow1800] = useState<TransformedData>({});
    const [row2100, setRow2100] = useState<TransformedData>({});
    const [row2400, setRow2400] = useState<TransformedData>({});
    const [row2700, setRow2700] = useState<TransformedData>({});

    const [dataSource, setDataSource] = useState<TableData[]>([]);
    const [chassisTypeValue, setChassisTypeValue] = useState('BalconySingle');

    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    const columns: TableProps['columns'] = [
        { title: '', dataIndex: 'rowLabel', key: 'rowLabel', rowScope: 'row', fixed: 'left', width: 70 },
        { title: '300', dataIndex: '300', key: '300' },
        { title: '600', dataIndex: '600', key: '600' },
        { title: '900', dataIndex: '900', key: '900' },
        { title: '1200', dataIndex: '1200', key: '1200' },
        { title: '1500', dataIndex: '1500', key: '1500' },
        { title: '1800', dataIndex: '1800', key: '1800' },
        { title: '2100', dataIndex: '2100', key: '2100' },
        { title: '2400', dataIndex: '2400', key: '2400' },
        { title: '2700', dataIndex: '2700', key: '2700' },
        { title: '3000', dataIndex: '3000', key: '3000' },
        { title: '3300', dataIndex: '3300', key: '3300' },
        { title: '3600', dataIndex: '3600', key: '3600' },
        { title: '3900', dataIndex: '3900', key: '3900' },
        { title: '4200', dataIndex: '4200', key: '4200' },
        { title: '4500', dataIndex: '4500', key: '4500' },
        { title: '4800', dataIndex: '4800', key: '4800' },
        { title: '5100', dataIndex: '5100', key: '5100' },
        { title: '5400', dataIndex: '5400', key: '5400' },
    ];

    const allRestData = () => {
        setRow300(defaultDataSource);
        setRow600(defaultDataSource);
        setRow900(defaultDataSource);
        setRow1200(defaultDataSource);
        setRow1500(defaultDataSource);
        setRow1800(defaultDataSource);
        setRow2100(defaultDataSource);
        setRow2400(defaultDataSource);
        setRow2700(defaultDataSource);
        setDataSource([]);
    }

    // 최초 화면 렌더링할 때 불러오기
    useEffect(() => {
        axios.get(findAllChassisPriceByCompanyTypeAndChassisType + `?companyType=HYUNDAI&chassisType=BalconySingle`, {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-admin-token") || '',
            },
        })
            .then(res => {
                const chassisPriceInfoList = res.data['chassisPriceInfoList'];

                const transformedData300: TransformedData = {};
                const transformedData600: TransformedData = {};
                const transformedData900: TransformedData = {};
                const transformedData1200: TransformedData = {};
                const transformedData1500: TransformedData = {};
                const transformedData1800: TransformedData = {};
                const transformedData2100: TransformedData = {};
                const transformedData2400: TransformedData = {};
                const transformedData2700: TransformedData = {};

                chassisPriceInfoList.forEach((item: { height: number; width: { toString: () => string | number; }; price: { toString: () => any; }; }) => {
                    if (item.height === 300) transformedData300[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 600) transformedData600[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 900) transformedData900[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 1200) transformedData1200[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 1500) transformedData1500[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 1800) transformedData1800[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 2100) transformedData2100[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 2400) transformedData2400[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 2700) transformedData2700[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                });

                setRow300(transformedData300);
                setRow600(transformedData600);
                setRow900(transformedData900);
                setRow1200(transformedData1200);
                setRow1500(transformedData1500);
                setRow1800(transformedData1800);
                setRow2100(transformedData2100);
                setRow2400(transformedData2400);
                setRow2700(transformedData2700);

                setDataSource([
                    { key: '1', rowLabel: '300', ...transformedData300 },
                    { key: '2', rowLabel: '600', ...transformedData600 },
                    { key: '3', rowLabel: '900', ...transformedData900 },
                    { key: '4', rowLabel: '1200', ...transformedData1200 },
                    { key: '5', rowLabel: '1500', ...transformedData1500 },
                    { key: '6', rowLabel: '1800', ...transformedData1800 },
                    { key: '7', rowLabel: '2100', ...transformedData2100 },
                    { key: '8', rowLabel: '2400', ...transformedData2400 },
                    { key: '9', rowLabel: '2700', ...transformedData2700 }
                ]);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                allRestData();
            });
    }, []);

    useEffect(() => {
        const companyType = mappedValueByCompany(curCompanyType);

        axios.get(findAllChassisPriceByCompanyTypeAndChassisType + `?companyType=${companyType}&chassisType=${chassisTypeValue}`, {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-admin-token") || '',
            },
        })
            .then(res => {
                const chassisPriceInfoList = res.data['chassisPriceInfoList'];

                const transformedData300: TransformedData = {};
                const transformedData600: TransformedData = {};
                const transformedData900: TransformedData = {};
                const transformedData1200: TransformedData = {};
                const transformedData1500: TransformedData = {};
                const transformedData1800: TransformedData = {};
                const transformedData2100: TransformedData = {};
                const transformedData2400: TransformedData = {};
                const transformedData2700: TransformedData = {};

                chassisPriceInfoList.forEach((item: { height: number; width: { toString: () => string | number; }; price: { toString: () => any; }; }) => {
                    if (item.height === 300) transformedData300[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 600) transformedData600[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 900) transformedData900[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 1200) transformedData1200[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 1500) transformedData1500[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 1800) transformedData1800[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 2100) transformedData2100[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 2400) transformedData2400[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                    if (item.height === 2700) transformedData2700[item.width.toString()] = addCommasToNumber(item.price.toString()) as string;
                });

                setRow300(transformedData300);
                setRow600(transformedData600);
                setRow900(transformedData900);
                setRow1200(transformedData1200);
                setRow1500(transformedData1500);
                setRow1800(transformedData1800);
                setRow2100(transformedData2100);
                setRow2400(transformedData2400);
                setRow2700(transformedData2700);

                setDataSource([
                    { key: '1', rowLabel: '300', ...transformedData300 },
                    { key: '2', rowLabel: '600', ...transformedData600 },
                    { key: '3', rowLabel: '900', ...transformedData900 },
                    { key: '4', rowLabel: '1200', ...transformedData1200 },
                    { key: '5', rowLabel: '1500', ...transformedData1500 },
                    { key: '6', rowLabel: '1800', ...transformedData1800 },
                    { key: '7', rowLabel: '2100', ...transformedData2100 },
                    { key: '8', rowLabel: '2400', ...transformedData2400 },
                    { key: '9', rowLabel: '2700', ...transformedData2700 }
                ]);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                allRestData();
            });
    }, [chassisTypeValue, curCompanyType]);

    const handleChange = (value: string) => {
        setChassisTypeValue(value);
    };

    return (
        <>
                <Tabs
                    defaultActiveKey="0"
                    onChange={(key) => setCurCompanyType(tabList[parseInt(key)])}
                    items={tabList.map((companyType, i) => ({
                        key: String(i),
                        label: companyType,
                    }))}
                />

                {/*샤시 브랜드 로고*/}
                <div style={{width:150}}>
                    {curCompanyType === HYUNDAI_ko && <img src={"https://www.hyundailnc.com/images/front/company/c_logo.png"}/>}
                    {curCompanyType === LX_ko && <img src={"https://www.zincatalog.com/resources/web/images/logo.svg"}/>}
                    {curCompanyType === KCC_GLASS_ko && <img src={"https://www.homecc.co.kr/images/logo_on_2022_2.png"}/>}
                </div>
                <Select
                    defaultValue={'발코니단창'}
                    style={{ width: 150 }}
                    onChange={handleChange}
                    options={chassisType}
                />
                <div
                    style={{
                        background: colorBgContainer,
                        minHeight: 280,
                        padding: 24,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {!dataSource.length ? (
                        <Result status="warning" title="데이터가 존재하지 않습니다." />
                    ) : (
                        <Table
                            dataSource={dataSource}
                            columns={columns}
                            pagination={false}
                            scroll={{ x: 2000, y: 650 }}
                            bordered
                            rowHoverable
                        />
                    )}
                </div>
                { dataSource.length !== 0 &&
                    <Divider orientation="center">가격 추가/수정</Divider>
                }

                { dataSource.length !== 0 &&
                    <div className="가격 추가/수정 칸" style={{marginTop:30}}>
                        <AddAndReviseChassisInfo />
                        <Divider/>
                    </div>
                }

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AdditionalChassisPriceCriteria />
                </div>
        </>
    );
};

export default ManipulateDatabase;
