// configure namespaces
Ext.ns('Strata', 'Strata.Report', 'Strata.Report.Human');


/**
 * @class Strata.Report.Human.Grid
 */
Ext.define('Strata.Report.Human.Grid', {
    extend : 'Strata.Grid',
    alias : 'widget.report-human-grid',

    // theese are public to have an ability to configure them from viewport
    selectedDateStart : null,
    selectedDateEnd : null,
    selectedMachineExternalId : null,
    selectedMachine : null,
    selectedShiftId : null,
    selectedShift : null,

    /**
     * initComponent
     * @protected
     */
    initComponent : function() {

        // hard coded - cannot be changed from outside
        var config = {
            loadMask: true,

            forceFit:true,

            // prepare store
            store:new Ext.data.Store({
                storeId: 'report-user-grid-store',
                model: 'Strata.Model.Report.Human',
                //id: 'id',
                proxy: {
                    type: 'ajax',
                    url: WEB_SERVICE + '/webservice/report/human',
                    reader: {
                        type: 'json',
                        root: 'results',
                        totalProperty: 'totalCount'
                    }
                    //simpleSortMode: true
                },
				pageSize: 10,
                remoteSort: true
            }),

            // prepare grouping and filters
            features: [new Ext.ux.grid.FiltersFeature({
                encode: false,
                local: false,
                filters: [
                    { type: 'numeric', dataIndex: 'external_id', phpMode: true}, 
                    { type: 'string', dataIndex: 'name'},
                    { type: 'list', dataIndex: 'type_id', store: Strata.Config.assetHumanTypeList(), labelField: 'name', phpMode: true},
                    { type: 'list', dataIndex: 'zone_id', store: Strata.Config.zoneList('', this), labelField: 'name', phpMode: true},
                    { type: 'numeric', dataIndex: 'alert_zone_id', phpMode: true},
                    { type: 'numeric', dataIndex: 'alert_zone_monitor', phpMode: true},
                    { type: 'numeric', dataIndex: 'alert_zone_silent', phpMode: true},
                    { type: 'numeric', dataIndex: 'alert_zone_warning1', phpMode: true},
                    { type: 'numeric', dataIndex: 'alert_zone_warning2', phpMode: true},
                    { type: 'numeric', dataIndex: 'alert_zone_hazard', phpMode: true},
                    { type: 'numeric', dataIndex: 'alert_zone_remote', phpMode: true}
                ]
            })],

            // column model
            columns:
                [
                 {header: 'External ID', width: 40, sortable: true, dataIndex: 'external_id'},
                 {header: 'Name', width: 100, sortable: true, dataIndex: 'name'},
                 {header: 'Type', width: 75, sortable: true, dataIndex: 'type_id'},
                 {header: LBL_ZONE, width: 75, sortable: true, dataIndex: 'zone_id'},
                 {header: 'ID Zone ', width: 50, sortable: true, dataIndex: 'alert_zone_id', hidden: true},
                 {header: 'Monitor Zone', width: 50, sortable: true, dataIndex: 'alert_zone_monitor', hidden: true},
                 {header: 'Silent Zone', width: 50, sortable: true, dataIndex: 'alert_zone_silent', hidden: true},
                 {header: 'Warning Zone 1', width: 50, sortable: true, dataIndex: 'alert_zone_warning1', hidden: true},
                 {header: 'Warning Zone 2', width: 50, sortable: true, dataIndex: 'alert_zone_warning2', hidden: true},
                 {header: 'Hazard Zone', width: 50, sortable: true, dataIndex: 'alert_zone_hazard'},
                 {header: 'Remote Stop', width: 50, sortable: true, dataIndex: 'alert_zone_remote'}
             ],


            // top toolbar
             dockedItems: [{
                 xtype: 'toolbar',
                 dock: 'top',
                 itemId: 'tbar',
                 items: [{
                    text:'Choose Start Date',
                    iconCls:'icon-date',
                    itemId: 'dateStartButton',
                    menu:  new Ext.menu.DatePicker({handler: this.changeDateStart, scope: this})
                }, {
                    text:'Choose End Date',
                    iconCls:'icon-date',
                    itemId: 'dateEndButton',
                    menu:  new Ext.menu.DatePicker({handler: this.changeDateEnd, scope: this})
                }, {
                    text:'Choose Machine',
                    iconCls:'icon-asset',
                    itemId: 'machineButton',
                    menu: new Ext.ux.menu.StoreMenu({
                        itemsHandler: Ext.Function.bind(this.changeMachine, this),
                        store: Strata.Config.assetMachineList(this)
                    })
                }, {
                    text:'Choose Shift',
                    iconCls:'icon-shift',
                    itemId: 'shiftButton',
                    menu: new Ext.ux.menu.StoreMenu({
                        itemsHandler: Ext.Function.bind(this.changeShift, this),
                        store: Strata.Config.shiftList()
                    })
                }, '->', {
                    text:'Go to Employee History',
                    iconCls:'icon-user-go',
                    itemId: 'goHumanHistoryButton',
                    tooltip: 'Choose Employee from the list to navigate to his History Report.',
                    disabled: true,
                    handler: Ext.Function.bind(this.goHumanHistoryReport, this)
                }/*, {
                    text:'Go to Machine Report',
                    iconCls:'icon-asset-go',
                    itemId: 'goMachineButton',
                    tooltip: 'Choose Employee from the list to navigate to his Machine Report.',
                    disabled: true,
                    handler: Ext.Function.bind(this.goMachineReport, this)
                }*/, {
                    text:'Print',
                    tooltip:'Print report',
                    iconCls:'icon-print',
                    handler: Ext.Function.bind(this.printGrid, this),
                    itemId: 'printButton'
                }]
            }],

            // paging bar on the bottom
            bbar: new Strata.PagingToolbar({
                store: 'report-user-grid-store',
                displayInfo: true,
                displayMsg: 'Displaying Employees {0} - {1} of {2}',
                emptyMsg: "No Employees to display"
            })
        }; // eo config object

        // apply config
        Ext.apply(this, Ext.apply(this.initialConfig, config));

        // call parent
		this.callParent(arguments);

        // configure selection model
        this.getSelectionModel().on('selectionchange', this.onSelectChange, this);
    },

    onSelectChange : function(selModel, selections) {
        // enable button 
        this.getDockedComponent('tbar').getComponent('goHumanHistoryButton').enable();

        var selected = selModel.getLastSelected().data;
        var data = [];
        var chart = Ext.getCmp('id-report-human-chart');
        var machine = (this.selectedMachineExternalId > 0) ? this.selectedMachine : 'All machines';

		data.push({alert: 'ID Zone',	times: selected.alert_zone_id});
		data.push({alert: 'Monitor Zone',	times: selected.alert_zone_monitor});
		data.push({alert: 'Silent Zone',	times: selected.alert_zone_silent});
		data.push({alert: 'Warning Zone 1',	times: selected.alert_zone_warning1});
		data.push({alert: 'Warning Zone 2',	times: selected.alert_zone_warning2});
		data.push({alert: 'Hazard Zone',	times: selected.alert_zone_hazard});
		data.push({alert: 'Remote Stop',	times: selected.alert_zone_remote});

        chart.store.loadData(data);
        chart.ownerCt.setTitle('Employees Report Chart - ' + selected.name + ' - ' + machine);
    },

    onRender : function() {
        // set additional date param, default is today
        if (this.selectedDateStart === null) {
            var today = new Date();
            this.selectedDateStart = today;
            this.store.proxy.extraParams['dateStart'] = Ext.Date.format(today, 'Y-m-d');
        }

        // call parent
		this.callParent(arguments);
    },

    changeDateStart : function (dp, date) {
        // set chaned variable in drill filters
        this.selectedDateStart = date;

        // change button text
        dp.ownerCt.ownerButton.setText(Ext.Date.format(this.selectedDateStart, 'F j, Y'));

        // set additional date param, for later use in paging
        this.store.proxy.extraParams['dateStart'] = Ext.Date.format(this.selectedDateStart, 'Y-m-d');

        // reload store. we are resetting paging here
        // @todo maybe we should reset also filters?
        this.store.load({params:{start:0, limit:10, dateStart: Ext.Date.format(this.selectedDateStart, 'Y-m-d'), machineExternalId: this.selectedMachineExternalId, shiftId: this.selectedShiftId}});
    },

    changeDateEnd : function (dp, date) {
        // set chaned variable in drill filters
        this.selectedDateEnd = date;

        // change button text
        dp.ownerCt.ownerButton.setText(Ext.Date.format(this.selectedDateEnd, 'F j, Y'));

        // set additional date param, for later use in paging
        this.store.proxy.extraParams['dateEnd'] = Ext.Date.format(this.selectedDateEnd, 'Y-m-d');

        // reload store. we are resetting paging here
        // @todo maybe we should reset also filters?
        this.store.load({params:{start:0, limit:10, dateStart: Ext.Date.format(this.selectedDateStart, 'Y-m-d'), dateEnd: Ext.Date.format(this.selectedDateEnd, 'Y-m-d'), machineExternalId: this.selectedMachineExternalId, shiftId: this.selectedShiftId}});
    },

    changeMachine : function(item) {
        // set dateEnd to dateStart if it is not set 
        if (!this.selectedDateEnd) { this.selectedDateEnd = this.selectedDateStart; }

        // set changed variable in drill filters
        var idArr = item.info.split(',', 2);

        this.selectedMachineExternalId = idArr[1];
        this.selectedMachine = item.text;

        // change button text
		this.getDockedComponent('tbar').getComponent('machineButton').setText(this.selectedMachine);
		
        // set additional machine id param, for later use in paging
        this.store.proxy.extraParams['machineExternalId'] = this.selectedMachineExternalId;

        // clear grid filters to avoid confusions
        this.filters.clearFilters();

        // reload store. we are resetting paging here
        // @todo maybe we should reset also filters?
        this.store.load({params:{start:0, limit:10, dateStart: Ext.Date.format(this.selectedDateStart, 'Y-m-d'), dateEnd: Ext.Date.format(this.selectedDateEnd, 'Y-m-d'), machineExternalId: this.selectedMachineExternalId, shiftId: this.selectedShiftId}});
    },

    changeShift : function(item) {
        // set dateEnd to dateStart if it is not set 
        if (!this.selectedDateEnd) { this.selectedDateEnd = this.selectedDateStart; }

        // set changed variable in drill filters
        var idArr = item.info.split(',', 2);

        this.selectedShiftId = idArr[1];
        this.selectedShift = item.text;

        // change button text
		this.getDockedComponent('tbar').getComponent('shiftButton').setText(this.selectedShift);

        // set additional shift id param, for later use in paging
        this.store.proxy.extraParams['shiftId'] = this.selectedShiftId;

        // reload store. we are resetting paging here
        // @todo maybe we should reset also filters?
        this.store.load({params:{start:0, limit:10, dateStart: Ext.Date.format(this.selectedDateStart, 'Y-m-d'), dateEnd: Ext.Date.format(this.selectedDateEnd, 'Y-m-d'), machineExternalId: this.selectedMachineExternalId, shiftId: this.selectedShiftId}});
    },

    openChart : function () {
        var bottomPanel = Ext.getCmp('id-report-chart');
        bottomPanel.expand();
    },

    goHumanHistoryReport : function () {
        // check if row is selected 
        if (!this.getSelectionModel().hasSelection()) {
            this.handleMissingSelection();
            return;
        }

        var tabs = Ext.getCmp('app-tabs');

        var shift = {
            id : this.selectedShiftId,
            name : this.selectedShift
        };

        // @pre select date and machine fields, reload grid
        Ext.getCmp('id-report-human-history-grid').prefillDrillFilters(
            this.selectedDateStart,
            this.selectedDateEnd,
            this.getSelectionModel().getLastSelected().data,
            shift
        );

        // go to Employee History Report tab
        tabs.setActiveGroup('tab-reports');
        tabs.setActiveTab('tab-report-human-history-grid');
    },

    goMachineReport : function () {
        // check if row is selected 
        if (!this.getSelectionModel().hasSelection()) {
            this.handleMissingSelection();
            return;
        }

        var tabs = Ext.getCmp('app-tabs');

        var shift = {
            id : this.selectedShiftId,
            name : this.selectedShift
        };

        // pre select date and human fields, reload grid
        Ext.getCmp('id-report-machine-grid').prefillDrillFilters(
            this.selectedDateStart,
            this.selectedDateEnd,
            this.getSelectionModel().getLastSelected().data,
            shift
        );

        // go to Machine Report tab
        tabs.setActiveGroup('tab-reports');
        tabs.setActiveTab('tab-report-machine');
    },

    handleMissingSelection : function () {
        Ext.Msg.alert(false, 'Please select row first.');
        this.goMachineButton.disable();
    },

    prefillDrillFilters : function (dateStart, dateEnd, machine, shift, humanTypeId) {
        // set dateEnd to dateStart if it is not set 
        if (!dateEnd) { dateEnd = dateStart }

        // set variables in drill filters
        this.selectedDateStart = dateStart;
        this.selectedDateEnd = dateEnd;
        this.selectedMachineExternalId = machine.external_id;
        this.selectedMachine = machine.name;
        this.selectedShiftId = shift.id;
        this.selectedShift = shift.name;

        // change button texts
        this.dateStartButton.setText(Ext.Date.format(this.selectedDateStart, 'F j, Y'));
        this.dateEndButton.setText(Ext.Date.format(this.selectedDateEnd, 'F j, Y'));
        this.machineButton.setText(this.selectedMachine);
        if (this.selectedShift) this.shiftButton.setText(this.selectedShift);

        // set additional params, for later use in paging
        this.store.proxy.extraParams['dateStart'] = Ext.Date.format(this.selectedDateStart, 'Y-m-d');
        this.store.proxy.extraParams['dateEnd'] = Ext.Date.format(this.selectedDateEnd, 'Y-m-d');
        this.store.proxy.extraParams['machineExternalId'] = this.selectedMachineExternalId;
        this.store.proxy.extraParams['shiftId'] = this.selectedShiftId;

        // prefilter type field
        if (humanTypeId > 0) {
            // we need to load store and use callback, otherwise  
            // filter is applied, but checkbox isn't selected
            this.filters.getFilter('type_id').store.load({
                scope : this,
                callback : function () {
                    this.filters.getFilter('type_id').setValue(humanTypeId);
                    this.filters.getFilter('type_id').setActive(true);
                }
            });
        }

        // reload store. we are resetting paging here
        // @todo maybe we should reset also filters?
        // @todo known bug: if report hasn't been loaded before and
        // we are trying to load it first time, it will be loaded
        // twice: one by render and one here. not a really big priority 
        // for now
        this.store.load({params:{start:0, limit:10, dateStart: Ext.Date.format(this.selectedDateStart, 'Y-m-d'), dateEnd: Ext.Date.format(this.selectedDateEnd, 'Y-m-d'), machineExternalId: this.selectedMachineExternalId, shiftId: this.selectedShiftId}});
    }
});
