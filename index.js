import React from 'react';
import ReactDOM from 'react-dom';

import {ApprovalI} from './components/ApprovalI';
import {TreeComponent} from './lib/ous'
import api from 'dhis2api';
import constants from './constants'

window.onload = function(){
/* Menu Bar */
    try {
        if ('Dhis2HeaderBar' in window) {
            Dhis2HeaderBar.initHeaderBar(document.querySelector('#header'), '../../../api', { noLoadingIndicator: true });
        }
    } catch (e) {
        if ('console' in window) {
            console.error(e);
        }
    }
    
/********/


    var select = {}
    select.selected = function(callback){
        debugger
    }
      
    ReactDOM.render(<TreeComponent  onSelectCallback={select}/>, document.getElementById('treeComponent'));


    var apiWrapper = new api.wrapper();
    
    var Pprogram = apiWrapper.getObj(`programs\\${constants.program_doc_diary}?fields=id,name,programStages[id,name,description,programStageDataElements[id,name,sortOrder,displayInReports,dataElement[id,name,formName,displayName,valueType,shortname,optionSet[id,name,code,options[id,name,code]]]]]`)
    var Pme = apiWrapper.getObj(`me.json?fields=id,name,displayName,organisationUnits[id,name],userGroups[id,name,code]`);
    var Pdes = apiWrapper.getObj(`dataElements?fields=id,formName,attributeValues[*,attribute[id,name,code]]&paging=false&filter=attributeValues.attribute.id:eq:${constants.de_sort_order_attribute}&order=attributeValues.value:desc`);
    
    Promise.all([Pprogram,Pme,Pdes]).then(function(values){

        console.log(values[2]);
        ReactDOM.render(<ApprovalI data ={
            {
                program : values[0],
                user : values[1],
                des : values[2]
            }
        }  services = {
            {
                ouSelectCallback :select
            }
        }/>, document.getElementById('form'));

    }).catch(reason => {
//        console.log(reason);
        // TODO
        ReactDOM.render(<div>No reports exist.</div>,document.getElementById('form'))
    });

}

