import React from 'react';
import loadable from "@loadable/component";
import { Switch, Route, Redirect } from 'react-router-dom';
import {InputNumber, Select} from "antd";
import chassisType from "../../definition/chassisType";

const FirstScreen = loadable(() => import('../../pages/calculateChassis/first'));

const App = () => {
    return (
        <Switch>
            <Redirect exact path="/" to="/fir" />
            <Route path="/fir" component={FirstScreen} />
        </Switch>


    // <table>
    //     <tbody>
    //     <tr>
    //         <td>
    //             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    //                 <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
    //                 <Title level={4}>
    //                     샤시 종류 선택 :
    //                 </Title>
    //             </div>
    //         </td>
    //         <td>
    //             <Select
    //                 defaultValue="샤시 종류 선택"
    //                 style={{ width: 150, marginTop: '18px', marginLeft: '20%' }}
    //                 onChange={handleChange}
    //                 options={chassisType}/>
    //         </td>
    //     </tr>
    //
    //     <tr>
    //         <td colSpan={2}>
    //             <div style={{marginTop:'10%', marginBottom:'-9%'}}>
    //                 <div style={{color: 'grey', textDecorationLine: 'underline'}}>
    //                     *가로 세로 수치는 10mm 단위로 작성 해주세요
    //                 </div>
    //             </div>
    //         </td>
    //     </tr>
    //     <tr>
    //         <td>
    //             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    //                 <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
    //                 <Title level={4}>
    //                     샤시 가로 (w) :
    //                 </Title>
    //             </div>
    //         </td>
    //         <td>
    //             <InputNumber style={{ width: 150, marginTop: '18px', marginLeft: '20%' }} addonAfter="mm" min={0} />
    //         </td>
    //     </tr>
    //     <tr>
    //         <td>
    //             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    //                 <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
    //                 <Title level={4}>
    //                     샤시 세로 (h) :
    //                 </Title>
    //             </div>
    //         </td>
    //         <td>
    //             <InputNumber style={{ width: 150, marginTop: '18px', marginLeft: '20%' }} addonAfter="mm" min={0} />
    //         </td>
    //     </tr>
    //     </tbody>
    // </table>
    )
}

export default App;
