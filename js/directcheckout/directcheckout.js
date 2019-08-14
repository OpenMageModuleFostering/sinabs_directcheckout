/**
 * Magento
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License (AFL 3.0)
 * that is bundled with this package in the file LICENSE_AFL.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/afl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    Sinabs
 * @package     js
 * @copyright   Copyright (c) 2014 Sinabs (http://www.sinabs.fr)
 * @license     http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 */
if (typeof Directcheckout == 'undefined') {
	var Directcheckout = {};
}

// Simplebuying
Directcheckout = Class.create();
Directcheckout.prototype = {
	initialize: function() {
		this._initModalbox();
		this._initFormSubmit();
		this._initRegister();
	},
	_initRegister: function() {
		var el = $('customer-register');
		if (el != null) {
			if (el.checked) {
				this.toggleRegisterForm();
			}
			el.observe('change', (function(e) { 
				this.toggleRegisterForm();
			}).bind(this));	
		}
	},
	_initModalbox: function() {
		document.observe('click', function(event) { 
			var element = $(Event.element(event));
			if(element.readAttribute('class') == 'modalbox') {
				Event.stop(event);
				Modalbox.show(element.readAttribute('href'), { 
					title: element.readAttribute('title')
				});
			}
		});
	},
	_initFormSubmit: function() {
		document.observe('submit', function(event) { 
			Event.stop(event);
			var element = Event.element(event);
			$(element).request({ 
				method: 'post',
				onLoading: function() {
					showLoader($(element));
				},
				onComplete: function(t) {
					var response = t.responseText.evalJSON();
					if (typeof(response.message) != 'undefined') {
						$(element).update(response.message).innerHTML;	
					}
					if (typeof(response.redirect) != 'undefined') {
						if (typeof(response.timeout) != 'undefined') {
							setTimeout(function() { window.location.href = response.redirect }, response.timeout);	
						} else {
							window.location.href = response.redirect;	
						}
					}
				}
			});
		});
	},
	toggleRegisterForm: function() {
		var c = $('wrapper-register').getStyle('display');
		$('wrapper-register').setStyle({ display: (c == 'none') ? 'block' : 'none' });
	}
}

// Simplebuying Billing
Directcheckout.Billing = Class.create();
Directcheckout.Billing.prototype = {
	initialize: function(args) {
		this.listRegion = args.listRegion;
		this._initBillingRegion();
	},
	_initBillingRegion: function() {
		this._updateBillingRegion();
		$('billing:country_id').observe('change', (function(e) {
			this._updateBillingRegion();
			if ($('use_for_shipping').value == 1) {
				updateSpo();	
			}
		}).bind(this));
	},
	_updateBillingRegion: function() {
		var code = $('billing:country_id').getValue();
		
		$('billing:region_id').select('option').each(function(o) { 
			o.remove();
		});
		
		if (this.listRegion[code]) {
			document.getElementById('billing:region_id').options[document.getElementById('billing:region_id').options.length] = new Option('Please select region, state or province', '');
			for (var i in this.listRegion[code]) {
				document.getElementById('billing:region_id').options[document.getElementById('billing:region_id').options.length] = new Option(this.listRegion[code][i].name, i);
			}
			$('billing:region_id').setStyle({ display: 'block' });
			$('billing:region').setStyle({ display: 'none' });
		} else {
			$('billing:region_id').setStyle({ display: 'none' });
			$('billing:region').setStyle({ display: 'block' });
		}
	}
}

// Simplebuying Shipping
Directcheckout.Shipping = Class.create();
Directcheckout.Shipping.prototype = {
	initialize: function(args) {
		this.listRegion = args.listRegion;
		this._initShippingRegion();
	},
	_initShippingRegion: function() {
		this._updateShippingRegion();
		$('shipping:country_id').observe('change', (function(e) { 
			this._updateShippingRegion();
			updateSpo();
		}).bind(this));
	},
	_changeShippingMethod: function() {
		$$('[name="shipping_method"]').each(function(r, i) { 
			$(r).observe('change', function(e) {
				if ($('use_for_shipping').value == 0) {
					updateSpo('shipping');	
				}
			});
		});
	},
	_updateShippingRegion: function() {
		var code = $('shipping:country_id').getValue();
		
		$('shipping:region_id').select('option').each(function(o) { 
			o.remove();
		});
		
		if (this.listRegion[code]) {
			document.getElementById('shipping:region_id').options[document.getElementById('shipping:region_id').options.length] = new Option('Please select region, state or province', '');
			for (var i in this.listRegion[code]) {
				document.getElementById('shipping:region_id').options[document.getElementById('shipping:region_id').options.length] = new Option(this.listRegion[code][i].name, i);
			}
			$('shipping:region_id').setStyle({ display: 'block' });
			$('shipping:region').setStyle({ display: 'none' });
		} else {
			$('shipping:region_id').setStyle({ display: 'none' });
			$('shipping:region').setStyle({ display: 'block' });
		}
	}
}

/**
* Functions
*/

currentPaymentMethod = null;

// Check if "use for shipping" checked
function checkUseForShipping(o) {
	$('shipping_address').setStyle({display: o ? 'block' : 'none'});
	$('use_for_shipping').value = (o == true) ? 0 : 1;
	updateSpo();
}

// Payment method switch and display associated content
function switchPaymentMethod(method) {
	var el = $('payment_form_' + method);
	if (currentPaymentMethod != null) {
		var elCurrent = $('payment_form_' + currentPaymentMethod);
		elCurrent.setStyle({ display: 'none' });
	}
	if (el) {
		$(el).setStyle({ display: 'block' });
		currentPaymentMethod = method;
	}
}


// New address selected
function newAddress(adType, value) {
	if (value == '') {
		$(adType + 'Form').setStyle({ display: 'block' });
	} else {
		$(adType + 'Form').setStyle({ display: 'none' });
	}
}

// Display loader on element e
function showLoader(e) {
	html = '<div class="directcheckout-loading-wrapper"><div class="directcheckout-loading"></div></div>';
	$(e).update(html).innerHTML;
}

// Update Shipping, Billing and Summary
function updateSpo(mode) {
	new Ajax.Request(urlSpo, { 
		parameters: $('directcheckout-form').serialize(true),
		onLoading: function() {
			if (mode != 'shipping' && mode != 'payment' && mode != 'review') {
				showLoader($('shipping_methods_list'));
			}
			if (mode != 'payment' && mode != 'review') {
				showLoader($('payment_methods_list'));
			}
			
			showLoader($('review_order'));
		},
		onSuccess: function(t) {
			var response = t.responseText.evalJSON();
			if (mode != 'shipping' && mode != 'payment') {
				$('shipping_methods_list').update(response.shipping_methods).innerHTML;
			}
			if (mode != 'payment') {
				$('payment_methods_list').update(response.payment_methods).innerHTML;
			}
			$('review_order').update(response.summary).innerHTML;
		}
	});
}

// Save Order
function saveOrder() {
	var myForm = new VarienForm('directcheckout-form', true);
	if(myForm.validator && myForm.validator.validate()) {
		new Ajax.Request(urlSaveOrder, { 
			parameters: $('directcheckout-form').serialize(true),
			onLoading: function() {
				$('submit-order').setStyle({ display: 'none' });
				$('review-please-wait').setStyle({ display: 'block' });
			},
			onSuccess: function(t) {
				$('submit-order').setStyle({ display: 'block' });
				$('review-please-wait').setStyle({ display: 'none' });
				
				var response = t.responseText.evalJSON();
				if (response.error) {
					str = "<p>";
					if (typeof(response.message) == 'string') {
						Modalbox.show(str + response.message + '</p>', {title:(response.title && typeof(response.title) == 'string') ? response.title : 'Error'});
					} else {
						response.message.each(function(i, r) { 
							str += r + '<br />';
							Modalbox.show(str);
						});
					}
				} else {
					if (response.redirect) {
						self.location = response.redirect;
					}
				}
			}
		});
    }
	return false;
}

// Update coupon code
function updateCouponCode(action) {
	var container = $('directcheckout-discount-wrapper');
	if (container != null) {
		var couponCode = $('coupon_code').value;
		if (couponCode != '') {
			new Ajax.Request(urlCoupon, { 
				parameters: {
					coupon: (action == 'delete') ? '' : couponCode
				},
				onLoading: function() {
					$('coupon_delete').setStyle({ display: 'none' });
					$('coupon_add').setStyle({ display: 'none' });
					$('button-loading').setStyle({ display: 'block' });
				},
				onSuccess: function(t) {
					var response = t.responseText.evalJSON();
					if (response.success == true) {
						$('button-loading').setStyle({ display: 'none' });
						if (action == 'delete') {
							$('coupon_add').setStyle({ display: 'block' });
							$('coupon_delete').setStyle({ display: 'none' });
							$('coupon_code').removeAttribute('readonly')
						} else {
							$('coupon_add').setStyle({ display: 'none' });
							$('coupon_delete').setStyle({ display: 'block' });
							$('coupon_code').setAttribute('readonly', 'readonly');
						}
						updateSpo('review');
					} else {
						$('button-loading').setStyle({ display: 'none' });
						$('coupon_add').setStyle({ display: 'block' });
						Modalbox.show('<p>' + response.message + '</p>', {title:(response.title && typeof(response.title) == 'string') ? response.title : 'Error'});
					}
				}
			});
		}
	}
}