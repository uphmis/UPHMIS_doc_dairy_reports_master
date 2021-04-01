exports.DHIS_URL_BASE = "https://uphmis.in/uphmis";
exports.username = "admin";
exports.password = "";

exports.program_doc_diary = "Bv3DaiOd5Ai";
exports.root_ou = "v8EzhiynNtf";
exports.attr_user = "fXG73s6W4ER";


exports.views = {
    login : "login",
    calendar : "calendar",
    entry : "entry",
    loading : "loader",
    settings: "settings"
};

exports.approval_status = {

    approved : "Approved",
    autoapproved : "Auto-Approved",
    rejected : "Rejected",
    resubmitted : "Re-submitted",
    pending2 : "Pending2",
    pending1 : "Pending1"
    
}

exports.approval_usergroup_level2_code="approval2ndlevel";
exports.approval_usergroup_level1_code="approval1stlevel";

exports.report_types = {

    approved: "approved",
    pending:"pending",
    rejected : "rejected"
}

exports.approval_status_de = "W3RxC0UOsGY";
exports.approval_rejection_reason_de = "CCNnr8s3rgE";

exports.attr_releiving_date = "mE6SY3ro53v";
exports.de_sort_order_attribute="FB2lVmfRZ83";

exports.query_ddReport = function(ou,sdate,edate){

    return `
            
select 
pi.trackedentityinstanceid,
max(filteredusers.speciality) as speciality,
max(psiou.uid) as psiouuid,
max(psiou.name) as facility2,
max(block2.name) as block2,
max(district2.name) as district2,
max(division2.name) as division2,
max(ps.name) as psispeciality,
max(ou.uid) as ouuid,
max(ou.name) as facility,
max(block.name) as block,
max(district.name) as district,
max(division.name) as division,
array_agg(distinct concat(tea.uid,':',teav.value)) as attrlist,
array_agg(distinct concat(de,':',devalue)) as delist
from programinstance pi
left join (
	select tei.organisationunitid,psi.programstageid,pi.trackedentityinstanceid as tei,de.uid as de,sum(tedv.value::float8) as devalue
	from programstageinstance psi
	inner join programinstance pi on pi.programinstanceid = psi.programinstanceid
	inner join trackedentitydatavalue tedv on tedv.programstageinstanceid = psi.programstageinstanceid
	inner join dataelement de on de.dataelementid = tedv.dataelementid
	inner join trackedentityinstance tei on tei.trackedentityinstanceid = pi.trackedentityinstanceid
	where tedv.value ~ '^-?[0-9]+.?[0-9]*$' and tedv.value !='0'
	and de.valuetype = 'NUMBER'
	and psi.executiondate between '${sdate}' and '${edate}'
	and psi.programstageid in (select programstageid
                                   			from programstage
                                   			where programid in(select programid
                                            		        	  from program
                                                    		  		where uid = 'Bv3DaiOd5Ai')
                                            )
	and tei.organisationunitid in (select organisationunitid 
									from organisationunit 
									where path like '%${ou}%')
	group by pi.trackedentityinstanceid,de.uid,tei.organisationunitid,psi.programstageid
	
	union
	select tei.organisationunitid,psi.programstageid,pi.trackedentityinstanceid as tei,
tedv.value,count(tedv.value)
	from programstageinstance psi
	inner join programinstance pi on pi.programinstanceid = psi.programinstanceid
	inner join trackedentitydatavalue tedv on tedv.programstageinstanceid = psi.programstageinstanceid
	inner join dataelement de on de.dataelementid = tedv.dataelementid
	inner join trackedentityinstance tei on tei.trackedentityinstanceid = pi.trackedentityinstanceid
	and psi.executiondate between '${sdate}' and '${edate}'
	and de.uid in ('x2uDVEGfY4K')
	and psi.programstageid in (select programstageid
                                   			from programstage
                                   			where programid in(
                                   							select programid
                              	            		        from program
                                	                   		where uid = 'Bv3DaiOd5Ai')
                              )
	and tei.organisationunitid in (select organisationunitid 
									from organisationunit 
									where path like '%${ou}%')
	group by pi.trackedentityinstanceid,de.uid,tei.organisationunitid,tedv.value,psi.programstageid
)tedv
on pi.trackedentityinstanceid = tedv.tei
left join trackedentityattributevalue teav on pi.trackedentityinstanceid = teav.trackedentityinstanceid
inner join trackedentityattribute tea on tea.trackedentityattributeid = teav.trackedentityattributeid
inner join organisationunit ou on ou.organisationunitid = pi.organisationunitid
left join programstage ps on ps.programstageid = tedv.programstageid
left join organisationunit psiou on psiou.organisationunitid = tedv.organisationunitid
left join organisationunit block on ou.parentid = block.organisationunitid
left join organisationunit district on block.parentid = district.organisationunitid
left join organisationunit division on district.parentid = division.organisationunitid

left join organisationunit block2 on psiou.parentid = block2.organisationunitid
left join organisationunit district2 on block2.parentid = district2.organisationunitid
left join organisationunit division2 on district2.parentid = division2.organisationunitid

inner join 
(
	select distinct teav.trackedentityinstanceid,ps.name as speciality
	from programstageusergroupaccesses psuga
	inner join programstage ps on ps.programstageid = psuga.programid
	inner join usergroupaccess uga on uga.usergroupaccessid = psuga.usergroupaccessid
	inner join usergroup ug on ug.usergroupid = uga.usergroupid
	inner join usergroupmembers ugm on ugm.usergroupid = ug.usergroupid
	inner join users u on u.userid = ugm.userid
	inner join trackedentityattributevalue teav on teav.value = u.username
	where psuga.programid in (select programstageid
	               			from programstage
	               			where programid in(select programid
	                        		        	from program
	                                		  	where uid = 'Bv3DaiOd5Ai')
	                                		  	)
	group by u.username,teav.trackedentityinstanceid,ps.name
)filteredusers
on filteredusers.trackedentityinstanceid = pi.trackedentityinstanceid
inner join trackedentityinstance tei on tei.trackedentityinstanceid = pi.trackedentityinstanceid
inner join trackedentitytype tet on tei.trackedentitytypeid = tet.trackedentitytypeid
where tet.uid = 'lI7LKVfon5c'
and pi.programid in (select programid from program where uid='Bv3DaiOd5Ai')
and pi.organisationunitid in (select organisationunitid 
				from organisationunit 
				where path like '%${ou}%')
group by pi.trackedentityinstanceid,division.organisationunitid,district.organisationunitid,block.organisationunitid,ou.name
order by speciality,division.name,district.name,block.name,ou.name


`

}


exports.query_jsonize = function(q){
    return `select json_agg(main.*) from (
            ${q}
            
        )main`;
}
