import React,{propTypes} from 'react';
import api from '../dhis2API';
import {ApprovalTable} from './ApprovalTable';
import constants from '../constants';
import moment from 'moment';

export function ApprovalI(props){
    
    var instance = Object.create(React.Component.prototype);
    instance.props = props;

    var desToDisplay = props.data.des.dataElements;

    var state = {

        program : props.data.program,
        user : props.data.user,
        selectedOU : props.data.user.organisationUnits[0],
        orgUnitValidation : "",
        specialityValidation : "",
        ouMode : "DESCENDANTS",
        sdate : moment().subtract(1,'months').startOf('month').format("YYYY-MM-DD"),
        edate : moment().subtract(1,'months').endOf('month').format("YYYY-MM-DD"),
        des : desToDisplay,
        selectedSpeciality : "-1",
        ous : []
    };

    
    props.services.ouSelectCallback.selected = function(ou){

        state.selectedOU = ou;
        state.orgUnitValidation = ""
        instance.setState(state);
    }
    
    instance.render = render;
    return instance;

    function onSpecialityChange(e){
        state.selectedSpeciality = e.target.value;
        state.specialityValidation = ""

        instance.setState(state);
    }

    function onOuModeChange(e){
        state.ouMode = e.target.value;
        instance.setState(state);
    }

    function onStartDateChange(e){
        state.sdate = e.target.value;
        instance.setState(state);
    }

    function onEndDateChange(e){
        state.edate = e.target.value;
        if ((Date.parse(state.sdate) >= Date.parse(state.edate))) {
            alert("End date should be greater than Start date");
        }
        else{
            instance.setState(state);
        }
    }

    function onTypeChange(e){
        state.type = e.target.value;
        instance.setState(state);
        
    }

    function validate(){
        if (state.selectedOU.id == undefined){
            state.orgUnitValidation = "Please select Facility from left bar"
            instance.setState(state);
            return false;
        }
        if ((Date.parse(state.sdate) >= Date.parse(state.edate))) {
            alert("End date should be greater than Start date");
            return false;
        }

       return true;
    }

    
    function getData(e){

        // validation
        if (!validate()){
            return;
        }
        
        state.rawData = null;
        state.loading=true;
        instance.setState(state);

        var Q = makeQuery();
        Q = constants.query_jsonize(Q);
        var sqlViewService = new api.sqlViewService();
        
        console.log(Q)
        sqlViewService.dip("DOC_DIARY_REPORT_",
                           Q,makeReport);
        
        function makeReport(error,response,body){

            if (error){
                alert("An unexpected error happenned. Please check your network connection and try again.");
                return;
            }

            if (!body.listGrid.rows[0][0]){
                alert("No Data");
                state.loading=false;
                instance.setState(state);
                return;
            }
            state.rawData = JSON.parse(body.listGrid.rows[0][0].value);
            state.loading=false;
            instance.setState(state);
            /*
            getOUWithHierarchy(function(error,response,body){
                if (error){
                    alert("An unexpected error happenned. Please check your network connection and try again.");
                    return;
                }

                state.ous = body.organisationUnits;
                state.loading=false;
                instance.setState(state);            
                
            });
            */
        }
        
        function makeQuery(){
            
            return constants.query_ddReport(state.selectedOU.id,
                                            state.sdate,
                                           state.edate);  
        }
        
        function getOUWithHierarchy(callback){
            
            var ous = state.rawData.reduce(function(list,obj){
                if (!list.includes(obj.ouuid)){
                    list.push(obj.ouuid)
                }
                return list;
            },[]);

            
            ous = ous.reduce(function(str,obj){
                if (!str){
                    str =  "" + obj + ""
                }else{
                    str = str + "," + obj + ""
                }
                
                return str; 
            },null);

            var apiWrapper = new api.wrapper();
            var url = `organisationUnits.json?filter=id:in:[${ous}]&fields=id,name,ancestors[id,name,level]&paging=false`;
            
            apiWrapper.getObj(url,callback)
        }
        
    }
    
    
    
    function render(){        
        
        function getApprovalTable(){
            
            if(!(state.rawData)){
                return (<div></div>)
            }        
            return (<ApprovalTable key="approvaltable"  rawData={state.rawData} selectedOU={state.selectedOU} sdate={state.sdate} edate={state.edate} program={state.program} user={state.user}  ous={state.ous} des={state.des}  />
                   );
            
        }
    
        
        return ( 
                <div>
                    <div className="card">
                <h3> Doc Diary Reports - Master </h3>
                
                <table>
                <tbody>
                <tr className="row">
              
                <td className="col-sm-4">  Selected Facility<span style={{"color":"red"}}> * </span>  :
                    <input disabled  value={state.selectedOU.name} className='form-control'></input>
                    <label key="orgUnitValidation" className="red"><i>{state.orgUnitValidation}</i></label>
                </td>
                    <td className="col-sm-4"> Select Start Period<span style={{"color":"red"}}> * </span>  :
                        <input type="date" value={state.sdate} onChange = {onStartDateChange} className='form-control' ></input>
                        <label key="startPeValidation" className="red" ><i>{}</i></label>
                    </td>
                    <td className="col-sm-4"> Select End Period<span style={{"color":"red"}}> * </span>  :
                        <input type="date" value={state.edate} onChange = {onEndDateChange} className='form-control'></input>
                        <label key="startPeValidation" className="red"><i>{}</i></label>
                    </td>
                </tr>
                <tr className="row">
                    <td colSpan="3" className="col-sm-8"><br/></td>
                </tr>

                <tr className="row">
                 <td className="col-sm-4">  <input type="submit" value="Submit" className='btn btn-primary' onClick={getData} ></input>
                 </td>
                <td className="col-sm-4" colSpan='2'> <img style = {state.loading?{"display":"inline"} : {"display" : "none"}} src="./images/loader-circle.GIF" alt="loader.." height="32" width="32"></img>
                </td></tr>

                <tr className="row">
                    <td colSpan="3" className="col-sm-8"><br/></td>
                </tr>
            </tbody>                
                </table></div>
                {
                    getApprovalTable()
                }
            
            </div>
        )
    }

}

