sap.ui.define([
		"sap/ui/test/Opa5",
		"sap/ui/test/actions/Press"
	], function(Opa5, Press) {
		"use strict";

		Opa5.createPageObjects({
			onMyPageUnderTest: {
				actions: {
					iDoMyAction: function() {
						return this.waitFor({
							id: "ControlId",
							viewName: "ViewName",
							actions: new Press(),
							errorMessage: "Was not able to find the control with the id ControlId"
						});
					}
				},
				assertions: {
					iDoMyAssertion: function() {
						return this.waitFor({
							id: "ControlId2",
							viewName: "ViewName",
							success: function() {
								Opa5.assert.ok(false, "Implement me");
								
							},
							errorMessage: "Was not able to find the control with the id ControlId2"
						});
					}
				}
			}
		});
	}
);