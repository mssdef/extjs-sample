// configure namespaces
Ext.ns('Strata', 'Strata.Report', 'Strata.Report.Human');

/**
 * @class Strata.Report.Human.Chart
 */
Ext.define('Strata.Report.Human.Chart', {
    extend : 'Strata.Chart',
    alias : 'widget.report-human-chart',

    /**
     * initComponent
     * @protected
     */
    initComponent : function() {

		var config = {
			loadMask: true,
			xtype: 'chart',

			style: 'background:#fff',
			animate: true,
			shadow: true,
			// prepare store, random for now
            store : Ext.create('Ext.data.Store', {
				fields: ['times', 'alert'],
				data: []
			}),
			axes: [{
				type: 'Numeric',
				position: 'left',
				fields: ['times'],
				title: 'Number of Times',
				grid: true,
				minimum: 0
			}, {
				type: 'Category',
				position: 'bottom',
				fields: ['alert'],
				title: 'Alert Type',
				calculateCategoryCount : true
			}],
			series: [{
				type: 'column',
				axis: 'left',
				//highlight: true,
				tips: {
                  trackMouse: true,
                  width: 140,
                  height: 28,
                  renderer: function(storeItem, item) {
                    this.setTitle(storeItem.get('alert') + ': ' + storeItem.get('times'));
                  }
                },
				label: {
				  display: 'insideEnd',
				  'text-anchor': 'middle',
					field: 'times',
					renderer: Ext.util.Format.numberRenderer('0'),
					orientation: 'vertical',
					color: '#666'
				},
				style: {
					fill: '#99BBE8'
				},
				xField: 'alert',
				yField: 'times'
			}]
		}
		// apply config
        Ext.apply(this, Ext.apply(this.initialConfig, config));

        // call parent
		this.callParent(arguments);
    }
});