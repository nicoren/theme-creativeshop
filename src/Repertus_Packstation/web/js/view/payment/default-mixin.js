define(
    [
        'ko',
        'Magento_Checkout/js/model/quote',
        'Magento_Ui/js/model/messageList',
        'mage/translate',
        'Magento_Checkout/js/model/payment-service',
        'Magento_Checkout/js/action/select-payment-method'
    ], function (
        ko,
        quote,
        messageList,
        $t,
        paymentService,
        selectPaymentMethod
    ) {
        'use strict';

        // Fix for translations in isAddressPackstationOrPostOffice function
        function isAddressPackstationOrPostOffice(address) {
            if (address == null) {
                return false;
            }

            var streetLines = address.street ? address.street : [],
                translations = ['packstation', 'post office', 'postfiliale'];

            return streetLines.some(function (entry) {
                entry = entry.toLowerCase();

                return translations.some(function (translation) {
                    return entry.indexOf(translation) >= 0;
                });
            });
        }

        var mixin = {

            initialize: function () {
                var me = this;

                me._super();

                quote.billingAddress.subscribe(function (address) {
                    if (isAddressPackstationOrPostOffice(address)) {
                        me.isPlaceOrderActionAllowed(false);
                        messageList.addErrorMessage({
                            message: $t('A Packstation or Post Office can not be selected as billing address.')
                        });
                        // Select first payment method
                        if (!quote.paymentMethod()) {
                            var paymentMethods = paymentService.getAvailablePaymentMethods();
                            if (paymentMethods.length) {
                                selectPaymentMethod(paymentMethods[0]);
                            }
                        }
                    }
                }, me);

                return me;
            }
        };

        return function (target) {
            return target.extend(mixin);
        };
    }
);