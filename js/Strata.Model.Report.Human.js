// configure namespaces
Ext.ns('Strata', 'Strata.Model');


/**
 * @class Strata.Model.Report.Human
 */
Ext.define('Strata.Model.Report.Human', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id', type: 'int'},
         {name: 'external_id', type: 'int'},
         {name: 'name', type: 'string'},
         /*  
          * Field is named type_id for filtering purposes.
          * It contains Type Name instead of Type Id.
          */
         {name: 'type_id', mapping: 'type_name'},
         /*  
          * Field is named zone_id for filtering purposes.
          * It contains Zone Name instead of Zone Id.
          */
         {name: 'zone_id', mapping: 'zone_name'},
         {name: 'alert_zone_id', type: 'int'},
         {name: 'alert_zone_monitor', type: 'int'},
         {name: 'alert_zone_silent', type: 'int'},
         {name: 'alert_zone_warning1', type: 'int'},
         {name: 'alert_zone_warning2', type: 'int'},
         {name: 'alert_zone_hazard', type: 'int'},
         {name: 'alert_zone_remote', type: 'int'}
    ]
});