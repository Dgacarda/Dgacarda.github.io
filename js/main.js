jQuery(function ($) {
    "use strict";

    let apiBase = 'http://91.201.55.168/api/odata/standard.odata/';
    let last_sended_code;
    let last_send_sms = 0;
    let objects;
    let services;
    let selected;
    let startDate = new Date();
    startDate = new Date(startDate.setHours(0, 0, 0, 0));

    $('#tel').inputmask('+7(999)999-99-99');

    var select = $('#options'),
        information = $('#information'),
        headerContainer = $('.days-header'),
        bodyContainer = $('.days-schedule'),
        name = $('#name'),
        tel = $('#tel'),
        type = $('#type'),
        confirm = $('#confirm'),
        choosenData = false,
        mouseDown = false,
        mobile = false,
        records = [],
        stage = 1;

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // $("#buttonsToSwipe").addClass("hideIt")
        mobile = true
    }

    $.ajaxSetup({ dataType: 'json' });

    function checkEmpty(o) {
        return o.val() && o.val() != $(o).attr('placeholder');
    }

    $(".schedule-days-table").swipe( {
        //Generic swipe handler for all directions
        swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
                if (direction === "up") {
                    this.preventDefault()
                }
                if (direction === "down") {
                    this.preventDefault()
                }
                if (direction === "right") {
                    if (stage < 3) {
                        bodyContainer.empty().hide()
                        headerContainer.empty().hide()
                        if (stage === 1) {
                            drawTime(3, 2, 4)
                            stage = 2
                        } else if (stage === 2) {
                            drawTime(3, 4, 6)
                            stage = 3
                        }
                        bodyContainer.fadeIn()
                        headerContainer.fadeIn()
                    }
                } else if (direction === "left") {
                    if (stage > 1) {
                        bodyContainer.empty().hide()
                        headerContainer.empty().hide()
                        if (stage === 2) {
                            drawTime(3, 0, 2)
                            stage = 1
                        } else if (stage === 3) {
                            drawTime(3, 2, 4)
                            stage = 2
                        }
                        bodyContainer.fadeIn()
                        headerContainer.fadeIn()
                    }
                }
        },
        //Default is 75px, set to 0 for demo so any distance triggers swipe
         threshold: 75
    });

    $('#main').on('submit', function (e) {
        e.preventDefault();

        var fValid = checkEmpty(name)
            && checkEmpty(tel)
            && checkEmpty(type);

        if (fValid) {
            let data = $(this).serializeArray();
            let phone = data.find(el => el.name == 'phone').value;

            let d = new Date();
            console.log(d);
            console.log(last_send_sms);
            if (d - last_send_sms < 60000) {
                $("#fail-sms-modal .modal-title").text("СМС можно отправлять не чаще раза в минуту");
                $("#fail-sms-modal").modal("show");
                return;
            }
            last_send_sms = d;

            if (phone.length < 16 || phone.indexOf("_") != -1) {
                $('#fail-sms-modal .modal-title').text('Неверный номер');
                $('#fail-sms-modal').modal("show");
                return;
            }

            // +7(922)618-49-72
            phone = phone.replace('(', '').replace(')', '').replace('+', '').replace('-', '').replace('-', '');

            let code = Math.random() * 10000;
            code = code - code % 1;
            //console.log(code);
            let smsdata = `user=11272&pass=79001976133&action=send&number=${phone}&text=Ваш+код+подтверждения:+${code}`;

            $.ajax({
                url: 'https://web.smsgold.ru/http2/?' + smsdata,
                method: "GET",
                //data: smsdata,
                success: (result) => {
                    last_sended_code = code;
                    $('#minor').slideDown();
                },
                error: (e) => {
                    last_sended_code = code;
                    $('#minor').slideDown();
                }
            });
        }
    });

    $('#minor').on('submit', function(e) {
        e.preventDefault();
        let code = $('#minor input').val();

        if (code != last_sended_code) {
            $("#fail-sms-modal .modal-title").text("Неверный код подтверждения");
            $("#fail-sms-modal").modal("show");
        }

        var data1 =  $("#main").serializeArray();
        var data2 = {
            Date: $('.days-schedule .picked').data().date,
            Time: $('.days-schedule .picked').text(),
            DivisionCode: selected,
        }
        for (let index in data1) data2[data1[index].name] = data1[index].value;

        /*
        Code: "6443"
        CodeTypeOfEmployment: "000000001"
        Comment: "ads"
        Date: "2019-03-06"
        DivisionCode: "000000002"
        FullName: "фыв"
        Phone: "+7(999)999-99-99"
        PostCode: "000000002"
        Time: "01:00"
        */
        $.ajax({
            url: 'http://91.201.55.168/api/hs/site/request',
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(data2),
            success: function(result) {
                $("#exampleModal").modal("hide");
                $("#success-modal").modal("show");
                $("#modalAccordeon").modal("hide");
            },
            error: function(xhr, resp, text) {
                console.log(resp);
                console.log(text);
                console.log(xhr);
                $("#fail-modal").modal("show");
            }
        });
    });

    $("#exampleModalButton").on("click", function() {
        $("#exampleModal").modal("show")
    })
    $("#options").on("change", function() {
        $("#exampleModal").modal("hide")
        
        selected = select.val();
        select.val('')
        
        let d2 = new Date(Number(startDate) + 4 * 24 * 60 * 60 * 1000)
        d2 = new Date(d2.setHours(23, 59, 59))

        if (!selected) return;

        bodyContainer.empty();
        headerContainer.empty();

        jQuery.ajax({
            url: apiBase + `Catalog_Посты?$format=json&$filter=DeletionMark eq false and Объект/Code eq '${selected}'&$select=Code`,
            success: (data, status, xhr) => {
                let posts_count = data.value.length;

                let dateTimes = [];

                
                let strd1 = startDate.toISOString();
                strd1 = strd1.slice(0, strd1.indexOf('.'));
                let strd2 = d2.toISOString();
                strd2 = strd2.slice(0, strd2.indexOf('.'));

                let url = `InformationRegister_ОнлайнЗаписьЗаявка_RecordType?$format=json&$filter=Пост/Объект/Code eq '${selected}' and Дата gt datetime'${strd1}' and Дата lt datetime'${strd2}'&$expand=Пост&$select=Пост/Code,Время,Дата`;

                jQuery.getJSON(apiBase + url, (data) => {
                    records = [];

                    for (let record of data.value) {
                        let rd = new Date(Date.parse(record.Дата));
                        let obj = {
                            post: record.Пост.Code,
                            date: rd,
                            time: record.Время.slice(11, 16)
                        };
                        records.push(obj);
                    }

                    

                    if (mobile) {
                        drawTime(3, 0, 2)
                    } else {
                        drawTime(3, 0, 6)
                    }

                    $("#modal-accordeon").modal("show")
                });
            }
        });
    });

    function drawTime(posts_count, i, count) {
        for (i; i < count; i++) {
            let d = new Date(Number(startDate) + i * 24 * 60 * 60 * 1000);
            let dn = d.toLocaleDateString('ru', {weekday: 'long'});
            let dd = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth()+1).padStart(2, '0')}.${d.getFullYear()}`;

            let el = `<div class="day-block day-header">${dd}<br><span class="day-name">${dn}</span></div>`;
            headerContainer.append(el);

            let item = '<div class="day-block day-header">';
            let strd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            for (let hour = 8; hour < 20; hour ++) {
                for (let minutes = 0; minutes < 60; minutes += 15) {
                    let time = String(hour).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
                    let rcount = records.filter(el => el.date - d == 0 && el.time == time).length;

                    if (rcount == posts_count) {
                        item += '<p class="blocked" disabled>' + time + '</p>';
                    } else {
                        item += '<p class="link" data-role="period" data-date="' + strd + '">' + time + '</p>';
                    }
                }
            }

            item += '</div>';
            bodyContainer.append(item);
        }
    }

    $('#sendSelection').on('click', function () {

    });

    $('.days-schedule').on('click', '.link', function (e) {
        if ($(this).hasClass('picked')) {
            $(this).removeClass('picked');
        } else {
            $(this).addClass('picked');
        }
        if ($('.days-schedule').find('.picked').length) {
            choosenData = true
        } else {
            choosenData = false
        }
    });
    function checkChoosen() {
        if ($('.days-schedule').find('picked')) {
            return true
        }
        return false
    }

    $('#prev-btn').click(() => {
        if ($('#prev-btn').hasClass('disabled')) return;

        let newDate = new Date(Number(startDate) - 24 * 60 * 60 * 1000);
        newDate = new Date(newDate.setHours(0, 0, 0, 0));
        let now = new Date();
        now = new Date(now.setHours(0, 0, 0, 0));

        $('#prev-btn').toggleClass('disabled', now - newDate == 0);
        startDate = newDate;
        $('#sendSelection').click();
    });

    $('#next-btn').click(() => {
        let newDate = new Date(Number(startDate) + 24 * 60 * 60 * 1000);
        newDate = new Date(newDate.setHours(0, 0, 0, 0));
        let now = new Date();
        now = new Date(now.setHours(0, 0, 0, 0));

        $('#prev-btn').toggleClass('disabled', now - newDate == 0);
        startDate = newDate;
        $('#sendSelection').click();
    });

    //  Accordion Panels
    $(".accordions div").show();
    setTimeout(() => $('.accordions .accordion').slideToggle('slow'), 1000);
    $('.accordions h3').click(function (e) {
        if (e.target.id === 'information' && !choosenData) {
            $(this).next('.accordion').hide()
        } else {
            $(this).next('.accordion').slideToggle('slow').siblings('.accordion:visible').slideUp('slow');
            $(this).toggleClass('current');
            $(this).siblings('h3').removeClass('current');
        }
    });

    jQuery.ajax({
        url: apiBase + 'Catalog_Подразделения?$format=json&$filter=DeletionMark eq false&$select=Code,Description',
        success: (data, status, xhr) => {
            objects = data.value;
            objects.forEach(obj => select.append(`<option value=${obj.Code}>${obj.Description}</option>`));
        }
    });

    jQuery.ajax({
        url: apiBase + 'Catalog_ОнлайнЗаписьТипЗанятости?$format=json&$filter=DeletionMark eq false&$select=Code,Description,МножительВремени',
        success: (data, status, xhr) => {
            services = data.value;
            services.forEach(service => type.append(`<option value=${service.Code}>${service.Description}</option>`));
        }
    });
});
