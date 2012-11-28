// configure namespaces
Ext.ns('Strata', 'Strata.Asset', 'Strata.Asset.Human', 'Strata.Asset.Human.Type');

/**
 * @class Strata.Asset.Human.Type.FormPanel
 */
Ext.define('Strata.Asset.Human.Type.Form', {
    extend : 'Strata.Form',
    alias : 'widget.asset-human-type-form',

    iconCls: 'icon-asset',
    title: 'Employee Type',
    frame: true,
    defaultType: 'textfield',
    forceLayout: true,
    fieldDefaults : {
        labelAlign: 'top',
        msgTarget: 'side'
    },
    defaults: {
        anchor: '90%'
    },

    // private A id to the currently loaded record
    recordId : null,

    // reference to parent object which references form
    parent : null,

    /**
     * initComponent
     * @protected
     */
    initComponent : function() {
        // build the form-fields.  Always a good idea to defer form-building to a method so that this class can
        // be over-ridden to provide different form-fields
        this.items = this.buildForm();

        // build form-buttons
        this.buttons = this.buildUI();

        // super
        this.callParent();
    },

    /**
     * buildform
     * @private
     */
    buildForm : function() {
        return [{
            fieldLabel: 'Name', 
            name: 'name',
            allowBlank: false,
            minLength: 1,
            maxLength: 50,
            vtype: 'assetname'
        },
        new Ext.form.ComboBox({
            fieldLabel: 'Status',
            name:'status',
            store: Strata.Config.activeList,
            typeAhead: true,
            queryMode: 'local',
            triggerAction: 'all',
            emptyText:'Select a status...',
            selectOnFocus:true,
            allowBlank: false,
            forceSelection: true
        }), {
            xtype:'textarea',
            fieldLabel: 'Description', 
            name: 'description', 
            allowBlank: true
        }
        ];
    },

    /**
     * buildUI
     * @private
     */
    buildUI: function(){
        return [{
            text: 'Cancel',
            iconCls: 'icon-cancel',
            handler: this.onCancel,
            scope: this
        }, {
            text: 'Reset',
            iconCls: 'icon-reset',
            handler: this.reset,
            scope: this
        }, {
            text: 'Save',
            iconCls: 'icon-asset',
            handler: this.onSave,
            scope: this
        }];
    },

    /**
     * loadRecord
     * @param {Record} rowId
     */
    loadRecord : function(rowId) {
        // I haven't found ability to configure it in other places
        this.getForm().trackResetOnLoad = true;

        this.getForm().load({
            url: WEB_SERVICE + '/webservice/asset-human-type/get/id/' + rowId,
            waitMsg: 'Loading...',
            failure: this.onFailure
        });

        this.recordId = rowId;
    },

    /**
     * onSave
     */
    onSave : function(btn, ev) {
        // check if record id exists to choose add or save action
        if (this.recordId > 0) {
            var action = 'save/id/' + this.recordId;
        } else {
            var action = 'add';
        }

        // return false if client side validation fails
        if (!this.getForm().isValid()) {
            return false;
        }

        // submit form
        this.getForm().submit({
            url: WEB_SERVICE + '/webservice/asset-human-type/' + action, 
            waitMsg:'Saving Data...', 
            submitEmptyText: false,
            success: this.onSuccess,
            failure: this.onFailure,
            scope: this
        });
    }
});