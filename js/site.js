var RECAPTCHA = {};

var BREAKPOINTS = {
    XS: 0,
    SM: 576,
    MD: 768,
    LG: 992,
    XL: 1200,
};

var onRecaptchaLoadCallback = function () {
    var recaptchaClass = 'g-recaptcha';
    var recaptchaSelector = '.' + recaptchaClass;

    $(recaptchaSelector).each(function (i, el) {
        var $el = $(el);
        var elId = $el.attr('id');
        var sitekey = $el.data('sitekey');
        var widgetId;

        widgetId = grecaptcha.render(elId, {
            sitekey: sitekey,
            callback: function (captchaResponse) {
                RECAPTCHA[elId] = {
                    widgetId: widgetId,
                    response: captchaResponse,
                };
            },
            theme: 'light',
        });
    });
};


function recordLinkedIn(pid, conId) {
    if (window.location.href.indexOf('linkedin') > 0) {
        $("body").append('<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=' + pid + '&conversionId=' + conId + '&fmt=gif" />');
    }
}

function recordGA(event, category, label) {
    try {
        gtag('event', event, { event_category: category, event_label: label });
    } catch (e) { }
}

function recordMixpanel(event, props) {
    var mp = window.mixpanel;

    if (typeof mp === 'object' && typeof mp.track === 'function') {
        mp.track(event, props);
    }
}

function onWebinarSuccess($form) {
    var $modal = $form.closest('.viewport-modal');
    var embedId = $form.data('target-video-embed');
    var videoId = embedId.split('-').slice(-1)[0];
    var $embed = $('#'+embedId);

    $form.data('target-video-embed', '');
    closeModal($modal);
    setCookie('ma-webinar-' + videoId, encodeURIComponent($form.serialize()));
    $embed.find('.video-embed_thumbnail').click();
}

function onDemoSuccess($form) {
    var $demoVideo = $('#demo-video');
    var $demoCard = $('#demo-modal .modal_card');
    var $demoForm = $('#demo-form');

    $demoForm.prop('hidden', true);
    $demoVideo.removeAttr('hidden');
    $demoCard.addClass('modal_card--wide');
    $demoCard.removeClass('modal_card--medium');

    recordLinkedIn(1074714, 1134522);
    setCookie('ma-watch', true, 1);
}
function onDemoFail() {
    var $fail = $('#demo-fail');
    var $demoForm = $('#demo-form');

    $demoForm.prop('hidden', true);
    $fail.removeAttr('hidden');
}

function onDemoEmbedThumbClick(e) {
    var $el = $(e.target);
    var $captureScreen = $el.closest('.capture-screen');
    $captureScreen.addClass('capture-screen--test');
}
function onDemoEmbedSuccess($form) {
    var $captureScreen = $form.closest('.capture-screen');
    $captureScreen.addClass('capture-screen--success');
}
function onDemoEmbedFail($form) {
    var $captureScreen = $form.closest('.capture-screen');
    $captureScreen.addClass('capture-screen--fail');
    $captureScreen.removeClass('capture-screen--test');
}

function onContactSuccess() {
    var $success = $('#contact-success');
    var $contactModal = $('#contact-modal');

    $contactModal.find('form')[0].reset();
    openModal($success);

    recordLinkedIn(1074714, 1134522);
}

function onContactFail() {
    var $fail = $('#contact-fail');
    var $contactModal = $('#contact-modal');

    $contactModal.find('form')[0].reset();
    $fail.addClass('modal--active');

    openModal($fail);
}


function onInfoPackSuccess() {
    var $success = $('#info-pack-success');
    var $infoPackForm = $('#info-pack-form');

    $infoPackForm[0].reset();

    openModal($success);
}
function onInfoPackFail() {
    var $fail = $('#info-pack-fail');
    var $infoPackForm = $('#info-pack-form');

    $infoPackForm[0].reset();

    openModal($fail);
}

function onTrialRequestSuccess($form, data) {
    var values = parseFormArray($form.serializeArray());

    values['campaign'] = getCampaign();

    recordMixpanel('TrialRequest', values);
}
function onTrialRequestFail($form) {
    var values = parseFormArray($form.serializeArray());

    values['campaign'] = getCampaign();
    values['submitError'] = true;

    recordMixpanel('TrialRequestFail', values);
}

function onEnterpriseContactSuccess() {
    var $success = $('#enterprise-contact-success');
    var $contactModal = $('#enterprise-contact-modal');

    $contactModal.find('form')[0].reset();
    $success.addClass('modal--active');

    openModal($success);

    recordLinkedIn(1074714, 1134522);
}

function onEnterpriseContactFail() {
    var $fail = $('#enterprise-contact-fail');
    var $contactModal = $('#enterprise-contact-modal');

    $contactModal.find('form')[0].reset();
    $fail.addClass('modal--active');

    openModal($fail);
}

function onPlayerFormContactSuccess() {
    var $success = $('#player-form-contact-success');
    var $contactModal = $('#player-form-contact-modal');

    $contactModal.find('form')[0].reset();
    $success.addClass('modal--active');
    openModal($success);
}

function onPlayerFormContactFail() {
    var $fail = $('#player-form-contact-fail');
    var $contactModal = $('#player-form-contact-modal');

    $contactModal.find('form')[0].reset();
    $fail.addClass('modal--active');

    openModal($fail);
}

var $playerFormModal = $('#player-form-preview');
var playerFormAttributes = [];

// close comes first cause that's when it's certain he iframe is there and ready to be removed
function onPlayerFormModalClose() {
    var $playerFormWrapper = $playerFormModal.find('[ma-form] > div');
    var $playerFormIframe = $playerFormWrapper.find('iframe');

    if ($playerFormIframe.get(0)) {
        playerFormAttributes = Array.prototype.slice.call($playerFormIframe.get(0).attributes);
    }

    $playerFormIframe.remove();
}

function onPlayerFormModalOpen() {
    var $playerFormWrapper = $playerFormModal.find('[ma-form] > div');
    var $playerFormIframe = $('<iframe />');

    if (playerFormAttributes.length > 0) {
        playerFormAttributes.forEach(function (attr) {
            $playerFormIframe.attr(attr.name, attr.value);
        });

        $playerFormWrapper.append($playerFormIframe);
    }
}

function openModal(el) {
    var $el = el instanceof jQuery ? el : $(el);
    var modalActiveClass = 'modal--active';
    var $activeModals = $('.' + modalActiveClass);

    $activeModals.removeClass(modalActiveClass);

    $el.addClass('modal--active');
}

function closeModal(el) {
    var $el = el instanceof jQuery ? el : $(el);
    var modalActiveClass = 'modal--active';

    $el.removeClass(modalActiveClass);
}

function showFormSuccessOverlay($form, data) {
    var formOverlayClass = 'form-overlay';
    var formOverlayActiveClass = formOverlayClass + '--active';
    var successElSelector = $form.attr('js-form:success-el');
    var $success = $(successElSelector);
    var failElSelector = $form.attr('js-form:fail-el');
    var $fail = $(failElSelector);
    var formValAttr = 'js-form-val';
    var formValSelector = '[' + formValAttr + ']';
    var $formVal = $success.find(formValSelector);

    $formVal.each(function () {
        var valProp = $(this).attr(formValAttr);
        var val = data[valProp];

        $(this).text(val);
    });

    $success.addClass(formOverlayActiveClass);
    $fail.removeClass(formOverlayActiveClass);
}

function showFormFailOverlay($form, data) {
    var formOverlayClass = 'form-overlay';
    var formOverlayActiveClass = formOverlayClass + '--active';
    var successElSelector = $form.attr('js-form:success-el');
    var $success = $(successElSelector);
    var failElSelector = $form.attr('js-form:fail-el');
    var $fail = $(failElSelector);
    var formValAttr = 'js-form-val';
    var formValSelector = '[' + formValAttr + ']';
    var $formVal = $form.find(formValSelector);

    $formVal.each(function () {
        var valProp = $(this).attr(formValAttr);
        var val = data[valProp];

        $(this).text(val);
    });

    $success.removeClass(formOverlayActiveClass);
    $fail.addClass(formOverlayActiveClass);
}

function hideFormOverlays($form) {
    var formOverlayClass = 'form-overlay';
    var formOverlayActiveClass = formOverlayClass + '--active';
    var successElSelector = $form.attr('js-form:success-el');
    var $success = $(successElSelector);
    var failElSelector = $form.attr('js-form:fail-el');
    var $fail = $(failElSelector);

    // @TODO(Daniel Stuessy) Remove the line below. Don't think 'form--hidden' isn't used. Test contact and demo forms, though
    $form.removeClass('form--hidden');
    $success.removeClass(formOverlayActiveClass);
    $fail.removeClass(formOverlayActiveClass);
}

function setCookie(name, value, days) {
    if (!days) {
        document.cookie = name + '=' + value + '; path=/';
    } else {
        var date = new Date(Date.now() + (days * 24 * 60 * 60 * 1000));

        document.cookie = name + '=' + value + ';' + 'expires=' + date.toUTCString()+ '; path=/';
    }
}

function getCookie(name) {
    var cookies = document.cookie
        .split(';')
        .map(function (c) {
            return c.split('=')
        })
        .reduce(function (obj, pair) {
            obj[pair[0].trim()] = pair[1];
            return obj;
        }, {});

    return cookies[name];
}

function getQueryString(name) {
    var results = new RegExp('[?&]' + name + '=([^&#]*)')
        .exec(window.location.search);

    return (results !== null) ? decodeURIComponent(results[1]) || 0 : false;
}

function getReferrer() {
    var referrer = '';
    try {
        var referrerCookie = getCookie('ma-ref');
        if (referrerCookie) {
            referrer = atob(decodeURIComponent(referrerCookie));
        }
    } catch (e) { }
    return referrer;
}

function getCampaign() {
    var campaign = '';
    try {
        var campaign = getCookie('ma-campaign');
    } catch (e) { }
    return campaign;
}


function hideErrors(formEl) {
    var $form = formEl instanceof jQuery ? formEl : $(formEl);
    var errorClass = 'form_group_errortext';

    $form.find('.' + errorClass).addClass(errorClass + '--hidden');
}

function showRecaptchaError(elId) {
    var errorClass = 'form_group_errortext';
    var $recaptchaError = $('.' + errorClass + '[for="' + elId + '"]');
    $recaptchaError.removeClass(errorClass + '--hidden');
}

function timeShowEl (el, mode, config) {
    var bool = false;
    var $el = $(el);
    var startAttr = config.showAttr + ':start';
    var endAttr = config.showAttr + ':end';
    var globalAttr = config.showAttr + ':global';
    var globalSelector = $el.attr(globalAttr) || '';
    var siblingAttr = config.showAttr + ':sibling';
    var siblingSelector = $el.attr(siblingAttr) || '';
    var $replacement = $(globalSelector);
    var $sibling = $el.siblings(siblingSelector);
    var startValue = moment($el.attr(startAttr) || '', config.format);
    var endValue = moment($el.attr(endAttr) || '', config.format);
    // NOTE: time has to be set AFTER the timezone is adjusted, or time comparisons will be inaccurate
    var time = moment().tz(config.timezone);
    var startTime = moment().tz(config.timezone).set({
        hour: startValue.hour(),
        minute: startValue.minute(),
        second: startValue.second(),
    });
    var endTime = moment().tz(config.timezone).set({
        hour: endValue.hour(),
        minute: endValue.minute(),
        second: endValue.second(),
    });

    if (mode === 'show') {
        bool = false;
    } else if (mode === 'hide') {
        bool = true;
    }

    if (time.isBetween(startTime, endTime) === bool) {
        $el.addClass('hidden');
        $replacement.removeAttr('hidden');
        $replacement.removeClass('hidden');
        $sibling.removeAttr('hidden');
        $sibling.removeClass('hidden');
    } else {
        $el.removeClass('hidden');
        $replacement.prop('hidden', true);
        $replacement.addClass('hidden');
        $sibling.prop('hidden', true);
        $sibling.addClass('hidden');
    }
}

function isBreakpointMin(breakpoint, windowWidth) {
    var width = windowWidth || window.innerWidth;

    return width >= BREAKPOINTS[breakpoint];
}

function isBreakpointMax(breakpoint, windowWidth) {
    var width = windowWidth || window.innerWidth;

    return width < BREAKPOINTS[breakpoint];
}

function onBreakpointMin(breakpoint, fn, args) {
    window.addEventListener('resize', function () {
        if (isBreakpointMin(breakpoint)) {
            fn.apply(null, args);
        }
    });
}

function onBreakpointMax(breakpoint, fn, args) {
    window.addEventListener('resize', function () {
        if (isBreakpointMax(breakpoint)) {
            fn.apply(null, args);
        }
    });
}

function setFirstAccordionHeight($accordion) {
    var $activeItem = $accordion.find('.accordion_item--active');
    var $accordionBody = $activeItem.find('.accordion_body');
    var firstHeight = $accordionBody.outerHeight(true);

    $accordion.data('first-height', firstHeight);
}

function parseFormArray(fields) {
    var values = {};

    for (var i = 0; i < fields.length; i++) {
        values[fields[i].name] = fields[i].value;
    }

    return values;
}

function parseJsonAttr(raw, def) {
    raw = raw || 'null';
    var parsed = JSON.parse(raw);
    var value = def !== undefined && parsed === null ? def : parsed;

    return value;
}

$(function () {
    var modalLinkAttr = 'js-modal';
    var modalLinkSelector = '[' + modalLinkAttr + ']';
    var modalActiveClass = 'modal--active';
    var modalClass = 'modal';
    var viewportModalClass = 'viewport-modal';
    var rootModalOpenClass = 'html--modal-open';
    var showModalAttr = 'js-show-modal';
    var showModalSelector = '[' + showModalAttr + ']';
    var $showModal = $(showModalSelector);
    var closeButtonSelector = '.modal_close, .viewport-modal_close';
    var captureScreenAttr = 'js-capture-screen';
    var captureScreenSelector = '[' + captureScreenAttr + ']';
    var $captureScreen = $(captureScreenSelector);


    function mobileMenu() {
        var menuBtnAttr = 'js-menu-btn';
        var menuBtnSelector = '[' + menuBtnAttr + ']';

        $(menuBtnSelector).on('click', function (e) {
            e.preventDefault();
            var $btn = $(e.target).closest(menuBtnSelector);
            var bodyToggleClass = $btn.attr(menuBtnAttr);

            if (bodyToggleClass) {
                $('html').toggleClass(bodyToggleClass);
            }
        });
    }

    function headerDropdown() {
        var linkAttr = 'js-header-dropdown';
        var linkSelector = '[' + linkAttr + ']';
        var actionAttr = linkAttr + ':action';
        var containerAttr = linkAttr + ':container';

        $(linkSelector).each(function () {
            var $link = $(this);
            if ($link.attr(actionAttr) !== 'hover') {
                return;
            }
            var dropdownClass = $link.attr(linkAttr);
            var dropdownActiveClass = dropdownClass + '--active';
            var dropdownSelector = '.' + dropdownClass;
            var $dropdown = $link.parent().find(dropdownSelector);
            var containerSelector = $link.attr(containerAttr);
            var $container = $link.closest(containerSelector);

            $link.mousemove(function (e) {
                e.stopPropagation();
                $dropdown.addClass(dropdownActiveClass);
            });

            $('body').mousemove(function (e) {
                var $target = $(e.target);
                var isMovingOutside = !($target.closest(linkSelector).is($link)
                    || $target.closest(containerSelector).is($container)
                    || $target.closest(dropdownSelector).is($dropdown));

                if (isMovingOutside) {
                    $dropdown.removeClass(dropdownActiveClass);
                }
            });
        });

        $(linkSelector).click(function (e) {
            e.preventDefault();
            var $link = $(e.target).closest(linkSelector);
            if ($link.attr(actionAttr) !== 'click') {
                return;
            }
            var dropdownClass = $link.attr(linkAttr);
            var dropdownActiveClass = dropdownClass + '--active';
            var dropdownSelector = '.' + dropdownClass;
            var $dropdown = $link.parent().find(dropdownSelector);

            $dropdown.toggleClass(dropdownActiveClass);
        });

        $('body').click(function (e) {
            var $target = $(e.target);
            var $link = $(linkSelector);
            var dropdownClass = $link.attr(linkAttr);
            var dropdownActiveClass = dropdownClass + '--active';
            var dropdownSelector = '.' + dropdownClass;
            var $dropdown = $link.parent().find(dropdownSelector);
            var isClickingOutside = !($target.closest(linkSelector).is($link) || $target.closest(dropdownSelector).is($dropdown));

            if (isClickingOutside) {
                $dropdown.removeClass(dropdownActiveClass);
            }
        });
    }

    function captureScreens() {
        $captureScreen.each(function (i, el) {
            var $el = $(el);
            var fnName = $el.attr(captureScreenAttr);
            var fn = window[fnName];

            $el.on('click', fn);
        });
    }

    function modals() {
        $('body').on('click', modalLinkSelector, function (e) {
            e.preventDefault();
            var $target = $(e.target);
            var $link = $target.closest(modalLinkSelector);
            var targetModalSelector = $link.attr(modalLinkAttr);
            var $modal = $(targetModalSelector);
            var $activeModals = $('.' + modalActiveClass);
            var cbName = $modal.data('on-open');
            var cbFn = cbName ? window[cbName] : function () { };

            $activeModals.removeClass(modalActiveClass);
            $modal.addClass(modalActiveClass);
            $('html').addClass(rootModalOpenClass);

            cbFn();
            accordion(true);
        });

        $('body').on('click', closeButtonSelector, function (e) {
            e.preventDefault();
            var $target = $(e.target);
            var $modal = $target.closest('.' + modalClass + ', .' + viewportModalClass);
            var cbName = $modal.data('on-close');
            var cbFn = cbName ? window[cbName] : function () { };

            $modal.removeClass(modalActiveClass);
            $('html').removeClass(rootModalOpenClass);

            window.location.hash = '';

            cbFn();
        });

        $showModal.each(function (i, el) {
            var hash = window.location.hash.replace('#', '');
            var $el = $(el);
            var modalLinkSelector = '[' + modalLinkAttr + '="#' + $el.attr('id') + '"]';
            var $modalLink = $(modalLinkSelector).first();
            var requiredHashStr = $el.attr(showModalAttr);
            var requiredHashes = requiredHashStr.split(/\s*,\s*/);
            var showModal = requiredHashes.reduce(function (bool, requiredHash) {
                return !bool ? hash === requiredHash : bool;
            }, false);

            if (showModal) {
                $modalLink.click();
            }
        });
    }

    function formWizards() {
        var formWizardAttr = 'js-form-wizard';
        var formWizardSelector = '[' + formWizardAttr + ']';
        var formWizardViewClass = 'form-wizard_view';
        var formWizardViewSelector = '.' + formWizardViewClass;
        var activeWizardViewClass = formWizardViewClass + '--active';
        var activeWizardViewSelector = '.' + activeWizardViewClass;
        var formWizardFormSelector = formWizardSelector + ' ' + formWizardViewSelector + ' form';
        var $wizards = $(formWizardSelector);

        $wizards.each(function () {
            var $wizard = $(this);
            var $views = $wizard.find(formWizardViewSelector);
        });

        $('body').on('submit', formWizardFormSelector, function (e) {
            e.stopPropagation();
            e.preventDefault();
            var $form = $(e.target);
            var $wizard = $form.closest(formWizardSelector);
            var $activeView = $wizard.find(activeWizardViewSelector);
            var $nextView = $activeView.next(formWizardViewSelector);
            var $activeForm = $activeView.find('form');
            var $finalForm = $wizard.find(formWizardViewSelector).last().find('form');
            var $fields = $form.find('[name]');

            if (!$activeForm.is($finalForm)) {
                $fields.each(function () {
                    var $field = $(this).clone();
                    var $preExistingField = $finalForm.find('[name="' + $field.attr('name') + '"]');
                    var fieldExists = $preExistingField.length > 0;

                    $field.attr('type', 'hidden');

                    if (!fieldExists) {
                        $finalForm.append($field);
                    } else {
                        $preExistingField.replaceWith($field);
                    }
                });
            }

            $activeView.removeClass(activeWizardViewClass);
            $nextView.addClass(activeWizardViewClass);
        });
    }

    function forms() {
        var formAttr = 'js-form';
        var formSelector = '[' + formAttr + ']';
        var formOverlayBackButtonClass = 'form-overlay_back';
        var formOverlayBackButtonSelector = '.' + formOverlayBackButtonClass;
        var formCampaignAttr = formAttr + ':campaign';

        $('body').on('click', formOverlayBackButtonSelector, function (e) {
            e.preventDefault();
            var $target = $(e.target);
            var $link = $target.closest('a');
            var formSelector = $link.attr('href');
            var $form = $(formSelector);

            hideFormOverlays($form);
        });

        $('body').on('submit', formSelector, function (e) {
            e.preventDefault();
            var $target = $(e.target);
            var $form = $target.closest(formSelector);
            var $submit = $form.find('[type="submit"]');
            var isLoading = $submit.hasClass('button--loading');
            var $recaptcha = $form.find('.g-recaptcha');
            var hasRecaptcha = $recaptcha.get().length > 0;
            var recaptchaId = $recaptcha.first().attr('id');
            var recaptchaResponse = hasRecaptcha
                && recaptchaId
                && typeof RECAPTCHA === 'object'
                && typeof RECAPTCHA[recaptchaId] === 'object'
                ? RECAPTCHA[recaptchaId].response : '';
            var recaptchaWidgetId = recaptchaResponse
                && recaptchaId
                ? RECAPTCHA[recaptchaId].widgetId : '';
            hideErrors($form);
            if (isLoading) {
                return;
            }
            if (hasRecaptcha && !recaptchaResponse) {
                showRecaptchaError(recaptchaId);
                return;
            }
            if (hasRecaptcha && typeof recaptchaWidgetId === 'number') {
                grecaptcha.reset(recaptchaWidgetId);
            }
            var action = $form.attr('action');
            var method = $form.attr('method');
            var success = $form.attr(formAttr + ':success');
            var fail = $form.attr(formAttr + ':fail');
            var always = $form.attr(formAttr + ':always');
            var groupFieldsStr = $form.attr(formAttr + ':group-fields');
            var groupDelimiterStr = $form.attr(formAttr + ':group-delimiter') || '';
            var groupItemDelimiterStr = $form.attr(formAttr + ':group-item-delimiter') || ',\n';
            var source = getQueryString('form-source') || $form.attr(formAttr + ':source');
            var extraParams = JSON.parse($form.attr(formAttr + ':extra-params') || '{}') || {};
            var data = $form
                .serializeArray()
                .concat([
                    { name: 'referrer', value: document.referrer },
                    { name: 'g-recaptcha-response', value: recaptchaResponse },
                ])
                .reduce(function (d, field) {
                    var value = d[field.name];
                    var valueIsArray = typeof value === 'object' && typeof value.length === 'number';
                
                    if (value === undefined) {
                        d[field.name] = field.value;
                    } else if (valueIsArray) {
                        d[field.name].push(field.value);
                    } else {
                        d[field.name] = [value, field.value];
                    }

                    if (field.name === 'hearus' && source && !valueIsArray) {
                        d[field.name] = source + ': ' + d[field.name];
                    }

                    return d;
                }, extraParams);

            if (groupFieldsStr) {
                var groupFields = groupFieldsStr.split(/\s*,\s*/);
                var targetFieldName = groupFields[0] || '';
                var targetFieldValue = data[targetFieldName];

                if (targetFieldName) {
                    for (var i = 1; i < groupFields.length; i++) {
                        if (typeof data[groupFields[i]] === 'object' && typeof data[groupFields[i]].length !== 'undefined') {
                            data[targetFieldName] = targetFieldValue + groupDelimiterStr + data[groupFields[i]].join(groupItemDelimiterStr);
                        } else {
                            data[targetFieldName] = targetFieldValue + groupDelimiterStr + data[groupFields[i]];
                        }
                    }
                }
            }

            var referrer = getReferrer();
            if (referrer) {
                data['referrer'] = referrer;
            }

            var attrCampaign = $form.attr(formCampaignAttr);
            var campaign = getCampaign() || '';
            if (attrCampaign || campaign) {
                data['campaign'] = attrCampaign || campaign;
            }

            var successFn = window[success];
            var failFn = window[fail];
            var alwaysFn = window[always];

            loadingButton($submit);

            $.ajax({
                type: method,
                url: action,
                data: JSON.stringify(data),
                dataType: 'json'
            }).done(function () {
                if (typeof successFn === 'function') {
                    successFn($form, data);
                }

                showFormSuccessOverlay($form, data);

                var category = $form.data('ga-category');
                var label = $form.data('ga-label');
                if (category && label) {
                    recordGA('Submit', category, label);
                    recordMixpanel('Submit', { category: category, label: label });
                }
            }).fail(function () {
                if (typeof failFn === 'function') {
                    failFn($form, data);
                }

                showFormFailOverlay($form, data);
            }).always(function () {
                enabledButton($submit);

                if (typeof alwaysFn === 'function') {
                    alwaysFn($form, data);
                }

                var $views = $form.closest('.form-wizard').find('.form-wizard_view');
                if ($views.length > 1) {
                    var $firstView = $views.first();
                    $views.removeClass('form-wizard_view--active');
                    $firstView.addClass('form-wizard_view--active');
                }
            });
        });

        function disabledButton($button) {
            $button.addClass('button--disabled');
            $button.removeClass('button--loading');
            $button.prop('disabled', true);
        }

        function loadingButton($button) {
            $button.addClass('button--loading');
            $button.removeClass('button--disabled');
            $button.prop('disabled', false);
        }

        function enabledButton($button) {
            $button.removeClass('button--disabled');
            $button.removeClass('button--loading');
            $button.prop('disabled', false);
        }
    }

    function social() {
        var linkAttr = 'js-social';
        var textAttr = linkAttr + ':text';
        var linkSelector = '[' + linkAttr + ']';
        var $links = $(linkSelector);
        var popupSettings = 'width=600, height=550';
        var popupNameTemplate = 'MoneyAliveShare{ type }';

        $links.each(function (i, link) {
            var $link = $(link);
            var platform = $link.attr(linkAttr);

            if (platform === 'linkedin') {
                var endpointTemplate = 'https://www.linkedin.com/shareArticle?mini=false&url={ url }';
                var url = encodeURIComponent([
                    window.location.protocol + '//',
                    window.location.hostname,
                    window.location.pathname,
                    '?' + window.location.search + '&nocache=' + Math.floor(Math.random() * 10000),
                    '#' + window.location.hash
                ]);
                var url = encodeURIComponent([
                    window.location.protocol + '/',
                    window.location.hostname,
                    window.location.pathname.replace(/^\//, '')
                ].filter(function (a) { return a }).join('/') +
                    '?' + [
                        window.location.search,
                        'nocache=' + Math.floor(Math.random() * 10000),
                    ]
                        .filter(function (a) { return a }).join('&') +
                    '#' + [
                        window.location.hash
                    ].filter(function (a) { return a }).join(''));
                var text = $link.attr(textAttr);
                var endpoint = endpointTemplate
                    .replace(pattern('url'), url);
                var popupName = popupNameTemplate
                    .replace(pattern('type', 'LinkedIn'));

                $link.attr('href', endpoint);
                $link.on('click', function (e) {
                    e.preventDefault();
                    window.open(endpoint, popupName, popupSettings);
                });
            }

            if (platform === 'twitter') {
                var endpointTemplate = 'https://twitter.com/share?ref_src=twsrc%5Etfw&url={ url }&text={ text }';
                var url = encodeURIComponent(window.location.href);
                var text = $link.attr(textAttr);
                var endpoint = endpointTemplate
                    .replace(pattern('text'), text)
                    .replace(pattern('url'), url);
                var popupName = popupNameTemplate
                    .replace(pattern('type', 'Twitter'));

                $link.attr('href', endpoint);
                $link.on('click', function (e) {
                    e.preventDefault();
                    window.open(endpoint, popupName, popupSettings);
                });
            }
        });

        function pattern(name) {
            return RegExp('{\\s*' + name + '\\s*}', 'g');
        }
    }

    function saveReferrer() {
        var referrer = getQueryString('referrer');
        if (referrer) {
            setCookie('ma-ref', referrer, 60);
        }
    }

    function saveCampaign() {
        var campaign = $('meta[name="ma:campaign"]').attr('content');
        var queryCampaign = [
            getQueryString('utm_medium'),
            getQueryString('utm_source'),
            getQueryString('utm_campaign'),
            getQueryString('utm_date'),
        ].filter(function (i) {
            return !!i && i !== 'undefined' && i !== 'null';
        });
        var queryCampaignDelimiter = '_';

        if (queryCampaign.length === 3) {
            campaign = queryCampaign.join(queryCampaignDelimiter);
        }

        if(campaign) {
            setCookie('ma-campaign', campaign, 30);
        }
    }

    function timeShow() {
        var showAttr = 'js-time-show';
        var hideAttr = 'js-time-hide';
        var showSelector = '[' + showAttr + ']';
        var hideSelector = '[' + hideAttr + ']';
        var config = {
            showAttr: showAttr,
            hideAttr: hideAttr,
            format: 'hh:mm:ss',
            timezone: 'Europe/London',
        };

        $(showSelector).each(function () {
            timeShowEl(this, 'show', config);
        });

        $(hideSelector).each(function () {
            timeShowEl(this, 'hide', config);
        });

        setInterval(function () {
            $(showSelector).each(function () {
                timeShowEl(this, 'show', config);
            });

            $(hideSelector).each(function () {
                timeShowEl(this, 'hide', config);
            });
        }, 5000);
    }

    function ctaPriority() {
        var ctaAttr = 'js-cta-priority';
        var ctaSelector = '[' + ctaAttr + ']';
        var ctaClass = 'cta';
        var highestPriority = 0;

        $(ctaSelector).each(function () {
            var $el = $(this);
            var priority = parseInt($el.attr(ctaAttr), 10);

            if (priority > highestPriority) {
                highestPriority = priority;
            }
        });

        $(ctaSelector).each(function () {
            var $el = $(this);
            var priority = parseInt($el.attr(ctaAttr), 10);

            if (priority === highestPriority) {
                $el.addClass(ctaClass);
            }

            $el.removeAttr(ctaAttr);
        });
    }

    function accordion(noEvents) {
        var accordionClass = 'accordion';
        var accordionSelector = '.' + accordionClass;
        var accordionBodyClass = 'accordion_body';
        var accordionBodySelector = '.' + accordionBodyClass;
        var accordionItemClass = 'accordion_item';
        var accordionItemActiveClass = 'accordion_item--active';
        var accordionItemActiveSelector = '.' + accordionItemActiveClass;
        var accordionItemSelector = '.' + accordionItemClass;
        var accordionListClass = 'accordion_list';
        var accordionListSelector = '.' + accordionListClass;
        var accordionHeaderClass = 'accordion_header';
        var accordionHeaderSelector = '.' + accordionHeaderClass;
        var accordionBodyAnimationTime = 500;
        var accordionExpandItemsClass = accordionClass + '--expand-items';

        $(accordionSelector).each(function () {
            var $activeAccordionItem = $(this).find(accordionItemActiveSelector);
            var $activeAccordionItemBody = $activeAccordionItem.find(accordionBodySelector);
            $activeAccordionItemBody.height('auto');
            var $accordion = $(this);
            var isExpandable = $accordion.hasClass(accordionExpandItemsClass);

            // delayed remeasure the initial height
            // of the first active item for accuracy
            setTimeout(function () {
                setFirstAccordionHeight($accordion);
            }, 500);

            if (!noEvents) {
                $(this).find(accordionHeaderSelector).click(function (e) {
                    e.preventDefault();
                    var $item = $(this).closest(accordionItemSelector);
                    var $items = $item.closest(accordionListSelector).children();
                    var $itemBody = $item.find(accordionBodySelector);
                    var $itemBodyChildren = $itemBody.children();
                    var itemBodyChildrenHeights = $itemBodyChildren.get().map(function (el) {
                        return $(el).outerHeight(true);
                    });
                    var itemBodyChildrenHeightSum = itemBodyChildrenHeights.reduce(function (sum, height) {
                        return sum + height;
                    }, 0);
                    var firstHeight = $accordion.data('first-height');
                    var targetHeight = isExpandable
                        ? itemBodyChildrenHeightSum
                        : firstHeight;

                    $items.each(function () {
                        $(this).removeClass(accordionItemActiveClass);

                        if (!$(this).is($item)) {
                            $(this).find(accordionBodySelector).animate({
                                height: 0,
                            }, accordionBodyAnimationTime);
                        }
                    });

                    $item.addClass(accordionItemActiveClass);
                    $item.find(accordionBodySelector)
                        .css('overflow-y', 'hidden')
                        .animate({
                            height: targetHeight,
                        }, accordionBodyAnimationTime, function () {
                            $(this).css('overflow-y', 'auto');
                        });
                });
            }
        });
    }

    function tabs(setListeners, classPrefix) {
        var classPrefix = classPrefix || '';
        var tabsClass = classPrefix + 'tabs';
        var tabsSelector = '.' + tabsClass;
        var tabsOpenClass = tabsClass + '--open';
        var tabsNotResponsiveClass = tabsClass + '--not-responsive';
        var tabsListClass = classPrefix + 'tabs_list';
        var tabsListSelector = '.' + tabsListClass;
        var tabClass = classPrefix + 'tabs_item';
        var tabSelector = '.' + tabClass;
        var tabActiveClass = tabClass + '--active';
        var tabActiveSelector = '.' + tabActiveClass;
        var tabLinkSelector = tabSelector + ' > a';
        var tabPanesClass = 'tab-panes';
        var tabPanesSelector = '.' + tabPanesClass;
        var tabPaneClass = 'tab-pane';
        var tabPaneSelector = '.' + tabPaneClass;
        var tabPaneActiveClass = tabPaneClass + '--active';
        var showTabHash = window.location.hash;
        var $showTab = $(tabSelector).filter(function () {
            return $(this).children('[href="' + showTabHash + '"]').length > 0;
        }).first();

        if (setListeners) {
            $(tabSelector).click(function (e) {
                e.preventDefault();
                var $targetTab = $(e.target).closest(tabSelector);
                var $targetLink = $targetTab.find('a');
                var targetPaneSelector = $targetLink.attr('href');
                var $targetPane = $(targetPaneSelector);
                var $tabPaneParent = $targetPane.closest(tabPanesSelector);
                var $tabPanes = $tabPaneParent.children();
                var $tabParent = $targetTab.closest(tabsListSelector);
                var $tabItems = $tabParent.children();
                var $tabs = $targetTab.closest(tabsSelector);
                var isResponsive = !$tabs.hasClass(tabsNotResponsiveClass);
                var isDropdown = isResponsive && isBreakpointMax('MD');
                var isOpen = $tabs.hasClass(tabsOpenClass);
                var targetSectionAttr = 'js-tabs:section';
                var targetSectionSelector = $tabs.attr(targetSectionAttr);
                var $targetSection = $(targetSectionSelector);
                var sectionModifierAttr = 'js-tabs:section-modifier';
                var sectionModifierClass = $targetLink.attr(sectionModifierAttr);
                var sectionModifierClasses = $tabs.find('a').get().reduce(function (list, linkEl) {
                    var modifierClass = $(linkEl).attr(sectionModifierAttr);
                    list.push(modifierClass);
                    return list;
                }, []);

                if (isDropdown && !isOpen) {
                    $tabs.addClass(tabsOpenClass);
                    sectionModifierClasses.forEach(function (modifierClass) {
                        $targetSection.removeClass(modifierClass);
                    });
                    $targetSection.addClass(sectionModifierClass);
                } else {
                    $tabItems.each(function () {
                        $(this).removeClass(tabActiveClass);
                    });

                    $tabPanes.each(function () {
                        $(this).removeClass(tabPaneActiveClass);
                    });

                    sectionModifierClasses.forEach(function (modifierClass) {
                        $targetSection.removeClass(modifierClass);
                    });

                    $targetTab.addClass(tabActiveClass);
                    $targetPane.addClass(tabPaneActiveClass);
                    $targetSection.addClass(sectionModifierClass);
                    $tabs.removeClass(tabsOpenClass);
                }

                setFirstAccordionHeight($targetPane.find('.accordion').first());
            });

            $(window).click(function (e) {
                var $target = $(e.target);
                var isntTabs = $target.closest(tabsSelector).length === 0;

                if (isntTabs) {
                    $(tabsSelector).removeClass(tabsOpenClass);
                }
            });
        }

        $showTab.click();
        if (isBreakpointMax('MD')) {
            $showTab.click();
            $('#modal .viewport-modal_inner').scrollTop(0);
        }
    }

    function proxyForm() {
        var formAttr = 'js-proxy-form';
        var formSelector = '[' + formAttr + ']';
        var $forms = $(formSelector);
        var focusAttr = 'js-proxy-form:focus';
        var targetModalAttr = 'js-proxy-form:modal';
        var targetTabAttr = 'js-proxy-form:tab';

        $forms.submit(function (e) {
            e.preventDefault();
            var $proxyForm = $(e.target);
            var targetFormSelector = $proxyForm.attr(formAttr);
            var $targetForm = $(targetFormSelector);
            var $proxyInputs = $proxyForm.find('[name]');
            var focusTargetName = $proxyForm.attr(focusAttr);
            var $focusTarget = $targetForm.find('[name="' + focusTargetName + '"]');
            var targetModalLinkSelector = '[js-modal="' + $proxyForm.attr(targetModalAttr) + '"]';
            var $targetModalLink = $(targetModalLinkSelector);
            var targetTabLinkSelector = '[js-tabs] [href="' + $proxyForm.attr(targetTabAttr) + '"]';
            var $targetTabLink = $(targetTabLinkSelector);

            $proxyInputs.each(function () {
                var $proxyInput = $(this);
                var name = $proxyInput.attr('name');
                var $targetInput = $targetForm.find('[name="' + name + '"]');

                $targetInput.val($proxyInput.val());
            });

            $targetModalLink.click();
            $targetTabLink.click();
            $focusTarget.focus();
        });
    }

    function linkForm() {
        var formAttr = 'js-link-form';
        var formSelector = '[' + formAttr + ']';
        var formCampaignAttr = formAttr + ':campaign';
        var $forms = $(formSelector);

        function findInputIndexByName(inputs, name) {
            var foundIndex = -1;

            for (var i = 0; i < inputs.length; i++) {
                if (inputs[i].name === name) {
                    foundIndex = i;
                    break;
                }
            }

            return foundIndex;
        }

        function gatherCampaigns($form) {
            var attrCampaign = $form.attr(formCampaignAttr);
            var campaign = getCampaign() || '';

            if (attrCampaign) {
                // add attribute campaign whilst ignoring undefined global campaign
                return [campaign, attrCampaign]
                    .filter(function (c) {return !!c;})
                    .join(',');
            }

            return campaign;
        }

        function queryPair(name, val) {
            return [encodeURIComponent(name), encodeURIComponent(val)].join('=');
        }

        function serializeQuery(queryList) {
            return queryList.join('&');
        }

        function buildActionUrl(baseUrl, queryList) {
            return baseUrl + '?' + serializeQuery(queryList);
        }

        $forms.submit(function (e) {
            e.preventDefault();
            var $form = $(e.target);
            var inputs = $form.serializeArray()
                .reduce(function (merged, input) {
                    var foundIndex = findInputIndexByName(merged, input.name);

                    if (foundIndex > -1) {
                        if (input.value.trim()) {
                            merged[foundIndex].value = merged[foundIndex].value + ',' + input.value;
                        }
                        return merged;
                    }

                    return merged.concat(input);
                }, []);
            var action = $form.attr('action');
            var queryString = (action.split('?') || [])[1] || '';
            var queryList = queryString.split('&').filter(function (query) {
                return query.trim();
            });
            var plainAction = action.replace('?' + queryString, '');

            inputs.forEach(function (input) {
                queryList.push(queryPair(input.name, input.value));
            });

            var campaign = gatherCampaigns($form);
            if (campaign) {
                queryList.push(queryPair('campaign', campaign));
            }

            window.open(buildActionUrl(plainAction, queryList));
        });
    }

    function hashchange() {
        $(window).on('hashchange', function () {
            modals();
            tabs();
            tabs(false, 'pill-');
        });
    }

    function dottedLines() {
        var lineAttr = 'js-line:target';
        var lineSelector = '[' + lineAttr.replace(':', '\\:') + ']';
        var $line = $(lineSelector);
        var lineColorAttr = 'js-line:color';
        var lineDottedAttr = 'js-line:dotted';
        var lineStartAttr = 'js-line:start';
        var lineEndAttr = 'js-line:end';
        var lineStartOffsetAttr = 'js-line:start-offset';
        var lineEndOffsetAttr = 'js-line:end-offset';
        var linePathStyleAttr = 'js-line:path-style';
        var lineStartGravity = 'js-line:start-gravity';
        var lineEndGravity = 'js-line:end-gravity';
        var lineSize = 'js-line:size';

        $line.each(function () {
            var $this = $(this);
            var target = $this.attr(lineAttr);
            var color = $this.attr(lineColorAttr);
            var dotted = parseJsonAttr($this.attr(lineDottedAttr), false);
            var start = $this.attr(lineStartAttr);
            var end = $this.attr(lineEndAttr);
            var startOffset = parseJsonAttr($this.attr(lineStartOffsetAttr), { x: '50%', y: '50%' });
            var endOffset = parseJsonAttr($this.attr(lineEndOffsetAttr), { x: '50%', y: '50%' });
            var pathStyle = $this.attr(linePathStyleAttr) || 'fluid';
            var startGravity = parseJsonAttr($this.attr(lineStartGravity), 'auto');
            var endGravity = parseJsonAttr($this.attr(lineEndGravity), 'auto');
            var size = parseFloat($this.attr(lineSize), 10) || 7;
            var options = {
                color: color,
                size: size,
                dash: dotted === true ? { len: 10, gap: 20 } : dotted,
                startSocket: start,
                path: pathStyle,
                endSocket: end,
                endPlug: 'behind',
                startSocketGravity: startGravity,
                endSocketGravity: endGravity,
            };

            switch (target) {
                case 'next':
                    new LeaderLine(
                        LeaderLine.pointAnchor($this[0], startOffset),
                        LeaderLine.pointAnchor($this.next()[0], endOffset),
                        options);
                    break;
                default:
                    new LeaderLine(
                        LeaderLine.pointAnchor($this[0], startOffset),
                        LeaderLine.pointAnchor($(target)[0], endOffset),
                        options);
                    break;
            }
        });
    }

    function videoEmbed() {
        var videoEmbedAttr = 'js-video-embed';
        var videoEmbedSelector = '[' + videoEmbedAttr + ']';
        var videoEmbedCaptureAttr = videoEmbedAttr + ':capture-modal';
        var videoEmbedTitleAttr = videoEmbedAttr + ':title';
        var videoEmbedCampaignAttr = videoEmbedAttr + ':campaign';
        var videoEmbedCaptureParamAttr = videoEmbedAttr + ':capture-param';
        var videoEmbedClass = 'video-embed';
        var videoEmbedThumbnailClass = 'video-embed_thumbnail';
        var videoEmbedThumbnailSelector = '.' + videoEmbedThumbnailClass;
        var videoEmbedVideoClass = 'video-embed_video';
        var videoEmbedVideoSelector = '.' + videoEmbedVideoClass;

        $(videoEmbedSelector).each(function (i, el) {
            var $videoEmbed = $(el);
            var videoId = $videoEmbed.attr('id').split('-').slice(-1)[0];
            var $videoWrapper = $videoEmbed.find(videoEmbedVideoSelector);
            var $thumbnailWrapper = $videoEmbed.find(videoEmbedThumbnailSelector);
            var captureParam = $videoEmbed.attr(videoEmbedCaptureParamAttr) || 'webinar-capture';
            var isCaptureUrlDisabled = (getQueryString(captureParam) || '').trim() === 'false';
            var captureModalId = $videoEmbed.attr(videoEmbedCaptureAttr);
            var captureBool = !isCaptureUrlDisabled && !!captureModalId;

            $videoWrapper.remove();

            $thumbnailWrapper.click(function () {
                var webinarCookie = decodeURIComponent(getCookie('ma-webinar-' + videoId) || '');

                if (captureBool && !webinarCookie) {
                    var $modal = $('#'+captureModalId);
                    var $form = $modal.find('.form');
                    var videoTitle = $videoEmbed.attr(videoEmbedTitleAttr) || '';
                    var videoCampaign = $videoEmbed.attr(videoEmbedCampaignAttr) || '';
                    var formSourceTemplate = $form.attr('js-form:source');
                    var formSource = formSourceTemplate.replace('XX', videoTitle);
                    $form.data('target-video-embed', $videoEmbed.attr('id'));
                    $form.attr('js-form:source', formSource);
                    if (videoCampaign) {
                        $form.attr('js-form:campaign', videoCampaign);
                    }
                    openModal($modal);
                } else {
                    if (webinarCookie) {
                        var emailFilterResult = webinarCookie.split('&').map(function (argStr) {
                            return argStr.split('=');
                        }).filter(function (argPair) {
                            return argPair[0] === 'email';
                        });
                        var emailPair = emailFilterResult[0] || [];
                        var email = decodeURIComponent(emailPair[1] || '');

                        if (email) {
                            $videoWrapper.find('.wistia_embed').addClass('email='+email);
                        }
                    }

                    $thumbnailWrapper.replaceWith($videoWrapper);
                }
            });
        });
    }

    function proxyClick() {
        var linkAttr = 'js-click-proxy';
        var linkSelector = '[' + linkAttr + ']';
        var $links = $(linkSelector);

        $links.click(function(e) {
            var $link = $(e.target).closest(linkSelector);
            var targetSelector = $link.attr(linkAttr);
            var $target = $(targetSelector);

            $target.click();
        });
    }

    function cookieConsent() {
        var COOKIE_VALUE = 1;
        var COOKIE_NAME = 'ma_cookie_consent';
        var COOKIE_LIFETIME = 365;
        var dialogClass = 'cookie-consent';
        var showCookieClass = dialogClass + '--show';
        var dialogAttr = 'js-cookie-consent';
        var buttonAttr = 'js-cookie-consent-agree';

        function consentWithCookies() {
            setCookie(COOKIE_NAME, COOKIE_VALUE, COOKIE_LIFETIME);
            hideCookieDialog();
        }

        function cookieExists(name) {
            return (document.cookie.split('; ').indexOf(name + '=' + COOKIE_VALUE) !== -1);
        }

        function hideCookieDialog() {
            var dialogs = document.getElementsByClassName(dialogClass);

            for (var i = 0; i < dialogs.length; ++i) {
                dialogs[i].className = dialogs[i].className.replace(showCookieClass, '');
            }
        }

        function showCookieDialog() {
            var dialogs = document.getElementsByClassName(dialogClass);

            for (var i = 0; i < dialogs.length; ++i) {
                dialogs[i].className = dialogs[i].className + ' ' + showCookieClass;
            }
        }

        function setCookie(name, value, expirationInDays) {
            var date = new Date();
            date.setTime(date.getTime() + (expirationInDays * 24 * 60 * 60 * 1000));
            document.cookie = name + '=' + value + '; ' + 'expires=' + date.toUTCString() +';samesite=lax';
        }

        function autoDismiss() {
            var dialogs = document.querySelectorAll('.' + dialogClass);

            for (var i = 0; i < dialogs.length; ++i) {
                var dialog = dialogs[i];
                var autodismissAttr = dialogAttr + ':autodismiss';
                var autodismiss = dialog.getAttribute(autodismissAttr);

                if (autodismiss === 'true') {
                    setCookie(COOKIE_NAME, COOKIE_VALUE, COOKIE_LIFETIME);
                }
            }
        }

        if(cookieExists(COOKIE_NAME)) {
            hideCookieDialog();
        } else {
            showCookieDialog();
            autoDismiss();
        }

        var buttons = document.querySelectorAll('[' + buttonAttr + ']') || [];

        for (var i = 0; i < buttons.length; ++i) {
            buttons[i].addEventListener('click', consentWithCookies);
        }
    }

    function paramedLinks() {
        var linkAttr = 'js-paramed-link';
        var linkSelector = '[' + linkAttr + ']';
        var $links = $(linkSelector);
        var paramsAttr = linkAttr + ':params';
        var campaign = getCampaign() || '';

        function parseParams(paramString) {
            return paramString.split('&')
                .filter(function (p) {return !!p;})
                .map(function (pair) {
                    return pair.split('=')
                        .filter(function (p) {
                            return !!p;
                        });
                });
        }

        function serializeParams(params) {
            return params
                .map(function (p) { return p.join('=')})
                .join('&');
        }

        $links.each(function () {
            var $link = $(this);
            var href = $link.attr('href');
            var baseParams = $link.attr(paramsAttr) || '';
            var paramRegex = /\?([^#]*)/;
            var hrefParamsString = (href.match(paramRegex) || [])[1] || '';
            var hrefParams = parseParams(hrefParamsString);
            var params = hrefParams.concat(parseParams(baseParams));
            var baseHref = href.replace(paramRegex, '');

            for (var i = 0; i < params.length; i++) {
                if (params[i][0] === 'campaign') {
                    params[i][1] = [campaign, params[i][1]]
                        .filter(function (c) {return !!c;})
                        .join(',');
                }
            }

            var serializedParams = serializeParams(params);
            var newHref = baseHref + '?' + serializedParams;

            $link.attr('href', newHref);
        });
    }

    mobileMenu();
    headerDropdown();
    modals();
    formWizards();
    forms();
    captureScreens();
    social();
    saveReferrer();
    saveCampaign();
    timeShow();
    ctaPriority();
    accordion();
    tabs(true);
    tabs(true, 'pill-');
    proxyForm();
    linkForm();
    hashchange();
    videoEmbed();
    proxyClick();
    cookieConsent();
    paramedLinks();
    setTimeout(function () {
        dottedLines();
    }, 500);

    $('.accordion_list li').each(function(i, el) {
        $(el).one('click', function() {
            var heading = $(this).find('.accordion_header').text();
            recordGA('click', 'accordion', heading);
            recordMixpanel('click', { category: 'accordion', label: heading });
        });
    });
});


