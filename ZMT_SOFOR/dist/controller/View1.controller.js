sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/MessageType",
	'sap/m/ColumnListItem',
	'sap/m/Input'
], function(Controller, Filter, JSONModel, MessageBox, MessageToast, MessageType, ColumnListItem, Input) {
	"use strict";

	return Controller.extend("com.tosyali.sofor03ZMT_SOFOR03.controller.View1", {

		onInit: function() {
			this.checkboxsecilen = [];
			this.yenikayit = [];

			var jModel = new JSONModel();
			var mModel = new JSONModel();

			mModel.setData([]);
			this.getView().setModel(mModel, "messages");
			this.oDataModel = this.getOwnerComponent().getModel();
			this.oGlobalBusyDialog = new sap.m.BusyDialog();

			var that = this;
            that.getView().bindElement("/SoforSet");
			var oFilters = [];
			oFilters.push(new sap.ui.model.Filter("Dogrulandi", sap.ui.model.FilterOperator.EQ, "X"));
			this.oDataModel.read("/SoforSet", {
				filters: oFilters,
				success: function(data) {
					jModel.setData(data.results);
					that.getView().setModel(jModel, "soforKod");
					if (data.results.length === 0) {
						MessageBox.error("Hiç Kayıt bulunamadı...");
					} else {
						MessageToast.show(data.results.length + "Kayıt var");
					}
				},
				error: function(err) {
					this.getView().getModel().setProperty("/busy", false);
				}
			});
		},

		onChangeRadio: function(e) {
			var jModel = new JSONModel();
			var that = this;
			var txt = e.getSource().getButtons()[e.getParameter("selectedIndex")].getId();			
			if (txt === "__xmlview0--RB1-1") {
				that.oGlobalBusyDialog.open();
				var oFilters = [];
				oFilters.push(new sap.ui.model.Filter("Dogrulandi", sap.ui.model.FilterOperator.EQ, "X"));
				this.oDataModel.read("/SoforSet", {
					filters: oFilters,
					success: function(data) {
						jModel.setData(data.results);
						that.getView().setModel(jModel, "soforKod");
						if (data.results.length === 0) {
							MessageBox.error("Hiç Kayıt bulunamadı...");
						} else {
							MessageToast.show(data.results.length + "Kayıt var");
							that.oGlobalBusyDialog.close();
						}
					},
					error: function(err) {
						that.oGlobalBusyDialog.close();
					}
				});
			} else {
				that.oGlobalBusyDialog.open();
				this.oDataModel.read("/SoforSet", {
					success: function(data) {
						jModel.setData(data.results);
						that.getView().setModel(jModel, "soforKod");
						if (data.results.length === 0) {
							MessageBox.error("Hiç Kayıt bulunamadı...");
						} else {
							MessageToast.show(data.results.length + "Kayıt var");
							that.oGlobalBusyDialog.close();
						}
					},
					error: function(err) {
						that.oGlobalBusyDialog.close();
					}
				});
			}
		},

		openSoforSH: function(oEvent) {
			if (!this.SoforShDiaolog) {
				this.SoforShDiaolog = sap.ui.xmlfragment("com.tosyali.sofor03ZMT_SOFOR03.view.fragments.sofor", this);
				this.getView().addDependent(this.SoforShDiaolog);
			}
			this.SoforShDiaolog.open();
		},

		HandleSoforSearchHelp: function(oEvent) {
			var val = oEvent.getParameter("value");
			var myfilter = new Filter("SOFORAD", sap.ui.model.FilterOperator.Contains, val);
			oEvent.getSource().getBinding("items").filter([myfilter]);
		},

		HandleSoforHelpClose: function(oEvent) {
			var item = oEvent.getParameter("selectedItem");
			if (item) {
				this.byId("SoforIDinput").setValue(item.getTitle());
			}
		},

		onSearch: function(oEvent) {
			this.getView().getModel().setProperty("/busy", true);
			var soforKod1 = this.byId("SoforIDinput").getValue();
			soforKod1 = soforKod1.split("-")[0];
			var myfilters = [];
			if (soforKod1.length > 0) {
				myfilters.push(new Filter("Soforid", sap.ui.model.FilterOperator.EQ, soforKod1));
			}

			var that = this;
			var jModel = new JSONModel();
			var msg = that.getView().getModel("messages");
			var messages = [];

			this.getOwnerComponent().getModel().read("/SoforSet", {
				filters: myfilters,
				success: function(data) {
					this.getView().getModel().setProperty("/busy", false);
					jModel.setData(data.results);
					that.getView().setModel(jModel, "soforKod");
					if (data.results.length == 0) {
						messages.push({
							type: MessageType.Warning,
							title: "Kayıt Bulunamadı",
							additionalText: "Hata Mevcut"

						});
						messages.push({
							type: MessageType.Error,
							title: "Kayıt Bulunamadı"

						});

						msg.setData(messages);
						msg.setProperty("/numberOfMessages", messages.length);
						this.getView().setModel(msg, "messages");
					} else {
						MessageToast.show(data.results.length + "Kayıt var");
						msg.setData([]);
						msg.setProperty("/numberOfMessages", 0);
						that.getView().setModel(msg, "messages");
					}

				}.bind(this),

				error: function(err) {
					this.getView().getModel().setProperty("/busy", false);
					MessageBox.error(JSON.parse(err.responseText).error.message.value);
				}

			});

		},

		onPressMessagePopover: function(oEvent) {
			if (!this._oMessagePopover) {
				this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(),
					"com.tosyali.sofor03ZMT_SOFOR03.view.fragments.MessagePopOver", this);
				this.getView().addDependent(this._oMessagePopover);
			}
			this._oMessagePopover.openBy(oEvent.getSource());
		},

		selectAll: function(oEvent) {
			var that = this;
			var otab = this.byId("idSoforTable"); // Fetch the table

			var bSelected = oEvent.getParameter('selected'); // fetch whether user selected/de-selected all

			otab.getItems().forEach(function(item) { // loop over all the items in the table
				var oCheckBoxCell = item.getCells()[0]; //fetch the cell which holds the checkbox for that row.

				oCheckBoxCell.setSelected(bSelected); // Select/de-select each checkbox
				if (bSelected === true) {
					item.getCells()[0].setEnabled(true);
					item.getCells()[2].setEnabled(true);
					item.getCells()[3].setEnabled(true);
					item.getCells()[4].setEnabled(true);
					var TCNo = oCheckBoxCell.getBindingContext("soforKod").getObject("Tckml");
					var gecerlimi = that.TCKimlikDogrula(TCNo);
					if (gecerlimi === false) {
						oCheckBoxCell.getParent("cells").getCells()[4].setValueState(sap.ui.core.ValueState.Error);
						var text = "TC Kimlik No yanlış!!";
						that.checkboxsecilen.push(text);
					} else {
						var Sofordata = oCheckBoxCell.getBindingContext("soforKod").getObject();
						that.checkboxsecilen.push(Sofordata);
					}
				} else {
					item.getCells()[0].setEnabled(true);
					item.getCells()[2].setEnabled(false);
					item.getCells()[3].setEnabled(false);
					item.getCells()[4].setEnabled(false);
				}

			});
		},

		OnPressYeniKayitEkle: function() {
			if (!this._create_popup) {
				this._create_popup = sap.ui.xmlfragment(this.getView().getId(), "com.tosyali.sofor03ZMT_SOFOR03.view.fragments.Create_PopUp",
					this);
				//this.getView().getId() bunu eklersen sap.ui.core yerine bununla alırsın verileri.
				this._create_popup.setModel();
			}
			this._create_popup.open();
		},

		onSaveFragments: function(oEvent) {
			var oEntry = {};

			var oDateFormat = sap.ui.core.format.DateFormat
				.getDateTimeInstance({
					pattern: "yyyy-MM-ddThh:mm:ss"
				});

			oEntry.Soforad = this.getView().byId("idAd").getValue();
			oEntry.Adi = this.getView().byId("idAd2").getValue();
			oEntry.Soyadi = this.getView().byId("idSAd").getValue();
			//oEntry.Dogumyili = this.getView().byId("idDogY").getValue();
			/*oEntry.Dogumyili = oDateFormat.format(new Date(this.getView().byId("idDogY").getDateValue()));*/
			oEntry.Ehliyetno = this.getView().byId("idEhNo").getValue();
			oEntry.EhliyetSno = this.getView().byId("idEhSNo").getValue();
			oEntry.EhliyetUlke = this.getView().byId("idEhU").getValue();
			oEntry.EhliyetSehir = this.getView().byId("idEhSh").getValue();
			oEntry.Ceptel = this.getView().byId("idCepT").getValue();
			oEntry.Plaka = this.getView().byId("idPlaka").getValue();
			oEntry.Pasaportno = this.getView().byId("idPas").getValue();
			oEntry.Sbtip = this.getView().byId("idSbtip").getValue();
			oEntry.Adres = this.getView().byId("idAdres").getValue();
			oEntry.Tckml = this.getView().byId("idTCKML").getValue();

			this.newSoforler.push(oEntry);

			var jModel = this.getView().getModel("soforKod");
			var soforKod = jModel.getData();
			soforKod.push(oEntry);
			jModel.setData(soforKod);
			this.getView().setModel(jModel, "soforKod");
		},

		onCloseFragments: function() {
			this._create_popup.close();
			this._create_popup.destroy();
			this._create_popup = null; //önemli.
		},

		onEdit: function(oEvent) {
			var that = this;
			if (oEvent.getParameter('selected') === true) {
				oEvent.getSource().getParent("cells").getCells()[0].setEnabled(true);
				oEvent.getSource().getParent("cells").getCells()[2].setEnabled(true);
				oEvent.getSource().getParent("cells").getCells()[3].setEnabled(true);
				oEvent.getSource().getParent("cells").getCells()[4].setEnabled(true);
				var TCNo = oEvent.getSource().getBindingContext("soforKod").getObject("Tckml");
				var gecerlimi = this.TCKimlikDogrula(TCNo);
				if (gecerlimi === false) {
					oEvent.getSource().getParent("cells").getCells()[4].setValueState(sap.ui.core.ValueState.Error);
					var text = "TC Kimlik No yanlış!!";
					that.checkboxsecilen.push(text);
				} else {
					var Sofordata = oEvent.getSource().getBindingContext("soforKod").getObject();
					that.checkboxsecilen.push(Sofordata);
				}

			} else {
				oEvent.getSource().getParent("cells").getCells()[0].setEnabled(true);
				oEvent.getSource().getParent("cells").getCells()[2].setEnabled(false);
				oEvent.getSource().getParent("cells").getCells()[3].setEnabled(false);
				oEvent.getSource().getParent("cells").getCells()[4].setEnabled(false);
			}
		},

		onPressBatchDelete: function() {
			this.oDataModel.setDeferredGroups(["mySoforler"]);
			var that = this;
			var i;
			for (i = 0; i < that.checkboxsecilen.length; i++) {
				var sofor = that.checkboxsecilen[i];

				that.oDataModel.remove("/SoforSet('" + sofor.Soforid + "')", {
					groupId: "mySoforler"
				});
			}
			this.oDataModel.submitChanges();
		},

		Update: function() {
			var that = this;
			var i;
			for (i = 0; i < that.checkboxsecilen.length; i++) {
				var sofor = that.checkboxsecilen[i];
				if (sofor === "TC Kimlik No yanlış!!") {
					that.onPressBatchUpdateFalse();
				} else {
					that.onPressBatchUpdate();
				}
			}
		},

		onPressBatchUpdate: function() {
			this.oDataModel.setDeferredGroups(["mySoforler"]);
			var that = this;
			var i;
			for (i = 0; i < that.checkboxsecilen.length; i++) {
				var sofor = that.checkboxsecilen[i];
				that.oGlobalBusyDialog.open();
				that.oDataModel.update("/SoforSet('" + sofor.Soforid + "')", sofor, {
					groupId: "mySoforler"
				});
				this.oDataModel.submitChanges();
			}
			MessageBox.success("Güncelleme Yapılmıştır.");
			that.oGlobalBusyDialog.close();
		},

		onPressBatchUpdateFalse: function() {
			MessageBox.error("TC Kimlik Numarası Yanlış Güncelleme Yapılamaz.");
		},

		onRefresh: function() {
			var that = this;
			var listRules = that.getView().byId("idSoforTable");
			listRules.getModel().refresh();
		},

		TCKimlikDogrula: function(tcno) {
			// geleni her zaman String'e çevirelim!
			tcno = String(tcno);

			// tcno '0' karakteri ile başlayamaz!
			if (tcno.substring(0, 1) === '0') {
				return false;
			}

			if (tcno.length !== 11) {
				return false;
			}
			var hane_tek;
			var hane_cift;
			var i, j;
			var ilkon_array = tcno.substr(0, 10).split('');
			var ilkon_total = hane_tek = hane_cift = 0;

			for (var i = j = 0; i < 9; ++i) {
				j = parseInt(ilkon_array[i], 10);
				if (i & 1) { // tek ise, tcnin çift haneleri toplanmalı!
					hane_cift += j;
				} else {
					hane_tek += j;
				}
				ilkon_total += j;
			}
			if ((hane_tek * 7 - hane_cift) % 10 !== parseInt(tcno.substr(-2, 1), 10)) {
				return false;
			}
			ilkon_total += parseInt(ilkon_array[9], 10);
			if (ilkon_total % 10 !== parseInt(tcno.substr(-1), 10)) {
				return false;
			}

			return true;
		}
	});
});