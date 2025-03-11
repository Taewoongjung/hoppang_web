import React from 'react';
import { Typography, Divider, Collapse, Alert } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const InfoSection = () => (
    <div
        style={{
            padding: '10px',
            maxWidth: window.innerWidth > 768 ? '90%' : '40%',
            width: window.innerWidth > 768 ? '90%' : '40%',
            boxSizing: 'border-box',  // 넘침 방지
            overflow: 'hidden'
        }}
    >
        <Alert
            message="호빵은 믿을 수 있는 제품만 취급합니다."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: '20px' }}
        />

        <Paragraph>
            <ul>
                <li><b>LX하우시스, 현대L&C, KCC글라스</b> 본사 직영점 제품만 판매</li>
                <li>품질보증: LX하우시스, 현대L&C(10년), KCC글라스(13년)</li>
                <li>A/S도 본사에서 직접 관리</li>
            </ul>
        </Paragraph>

        <Divider />

        <Alert
            message="견적에는 시공비 및 물류비가 포함됩니다."
            type="info"
            showIcon
            icon={<ExclamationCircleOutlined />}
            style={{ marginBottom: '20px' }}
        />
        <Paragraph>
            단, 실제 실측 결과 및 추가 장비 비용(사다리차 등)에 따라 금액이 달라질 수 있습니다.
        </Paragraph>

        <Divider />

        <Title level={4}>✅ 타사 비교 시 꼭 체크하세요!</Title>
        <Collapse
            defaultActiveKey={['1', '2']}
            style={{ backgroundColor: '#fff', borderRadius: '5px' }}
        >
            <Panel header="1. 유리 사양" key="1">
                <Paragraph>
                    • LX하우시스, 현대L&C: <b>24mm 기준</b><br/>
                    • KCC글라스: <b>26mm (외부창 로이유리 포함 기준)</b><br/>
                    • (22~28mm는 열 효율 차이 없음)<br/>
                    • 일부 업체는 이중창 내부 유리를 5mm로 사용해 저렴해 보이게 할 수 있으니 주의!<br/>
                    • LX하우시스, 현대L&C 로이유리 선택 시 약 <b>5% 추가 비용</b> 발생
                </Paragraph>
            </Panel>
            <Panel header="2. 자동 핸들 포함 여부" key="2">
                <Paragraph>
                    • 호빵 견적은 모든 창에 <b>자동 핸들 포함!</b><br/>
                    • 일부 업체는 내부창 핸들을 제외해 가격을 낮추는 경우가 있음<br/>
                    • 자동 핸들이 빠지면 가격 차이가 크므로 꼭 확인하세요.
                </Paragraph>
            </Panel>
        </Collapse>

        <Divider />

        <Alert
            message="📌 정확한 실측 후 최종 견적이 확정됩니다."
            type="warning"
            showIcon
            style={{ marginTop: '20px' }}
        />
        <Alert
            message="📌 추가 비용이 발생할 수 있는 부분을 꼭 체크하고 비교하세요!"
            type="warning"
            showIcon
            style={{ marginTop: '10px' }}
        />
    </div>
);

export default InfoSection;
