var domain_pubref = window.domain_pubref || "//pubref.paperol.cn";
var domain_pubnew = window.domain_pubnew || "//pubnew.paperol.cn";
var domain_pubali = window.domain_pubali || "https://pubali.oss-cn-hangzhou.aliyuncs.com";
function downloadPdf(fileName, options) {
    var layerIndex = 0;
    var showLayer = function () {
        layerIndex = layer.load(1, {
            content: '正在为您生成下载文件,<span id="spanExportProcessText">0%</span>',
            shade: [0.4, '#393D49'],
            // time: 10 * 1000,
            success: function (layero) {
                layero.css('margin-left', '-42px');
                layero.find('.layui-layer-content').css({
                    'padding-top': '40px',
                    'width': '170px',
                    'color': 'white',
                    'background-position-x': '56px',
                    'font-size': '13px',
                    'font-weight': 'bold'
                });
            }
        })
    }
    $(".arrge i").hide();
    var closeLayer = function () {
        $('body').css("overflow-Y", "auto");
        $('body').css("overflow-X", "auto");
        layer.close(layerIndex);
    }
    var isIE = function () {
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            return true;
        } else {
            return false;
        }
    }
    var elementsArr = [];
    var canvasArr = [];
    var totalECount = 0;
    var elements = [];
    var imgArr = [];
    var downloadHideElementsArr = [];

    var handleTableScoll = {
        before: function () {
            $('[exportbackup="1"]').each(function () {
                var maxWidth = 0;
                var areaWidth = $(this).width();
                $(this).find('table,[exportscroll="1"]').each(function () {
                    var thisWidth = $(this)[0].scrollWidth;
                    if (thisWidth > maxWidth) {
                        maxWidth = thisWidth;
                    }
                });
                if (maxWidth > areaWidth) {
                    $(this).closest('[export="1"]').removeAttr('export').find('[exportbackup="1"]').removeAttr('exportbackup').attr('export', 1);
                }
            });
            $('[export="1"]').each(function () {
                var maxWidth = 0;
                var maxWidthE;
                var areaWidth = $(this).width();
                $(this).find('table,[exportscroll="1"]').each(function () {
                    var thisWidth = $(this)[0].scrollWidth;
                    if (thisWidth > maxWidth) {
                        maxWidth = thisWidth;
                        maxWidthE = $(this);
                    }
                });
                if (maxWidth > areaWidth) {
                    var curObj = $(this)[0];
                    if (curObj.style && curObj.style.width) {
                        $(this).attr('oldwidth', curObj.style.width);
                    }
                    else {
                        $(this).attr('oldwidth', "-");
                    }
                    curObj.style.width = maxWidth + 'px';
                }
            });
        },
        after: function () {
            $('[export="1"]').each(function () {
                var oldWidth = $(this).attr('oldwidth')
                if (oldWidth) {
                    if (oldWidth == "-") oldWidth = "";
                    $(this)[0].style.width = oldWidth;
                    $(this).removeAttr('oldwidth');
                }
            });
        },
        hasScrollElement: function (element) {
            var maxWidth = 0;
            var areaWidth = element.width();
            var containerWidth = $('[export-temp-container="1"]').width();
            var hasScrollElement = false;
            element.find('table,[exportscroll="1"]').each(function () {
                var thisWidth = $(this)[0].scrollWidth;
                if (thisWidth > maxWidth) {
                    maxWidth = thisWidth;
                }
                hasScrollElement = true;
            });
            if (!hasScrollElement || maxWidth < containerWidth) {
                return { result: false };
            }
            if (maxWidth > areaWidth) {
                return { result: true, maxWidth: maxWidth };
            }
            return { result: false };
        }
    };

    var core = function () {
        showLayer();
        $(window).scrollTop(0);
        $('body').css("overflow-Y", "hidden");
        $('body').css("overflow-X", "hidden");
        handleQywxTransfer(function () {
            $('img').each(function () {
                var src = $(this).attr("src");
                if (src && src.indexOf('//pubnew.paperol.cn') == 0) {
                    $(this).attr('src', src.replace("//pubnew.paperol.cn", "//pubref.paperol.cn")).attr('olddomain', '//pubnew.paperol.cn');
                }
                else if (src && src.indexOf('//pubnewfr.paperol.cn') == 0) {
                    $(this).attr('src', src.replace("//pubnewfr.paperol.cn", "//pubref.paperol.cn")).attr('olddomain', '//pubnewfr.paperol.cn');
                }
                else if (src && src.indexOf('//jpnpubup.sojump.com') == 0) {
                    $(this).attr('src', src.replace("//jpnpubup.sojump.com", "//jpnpubupref.sojump.com")).attr('olddomain', '//jpnpubup.sojump.com');
                }
                else if (src && src.indexOf('//jpnpubupfr.sojump.com') == 0) {
                    $(this).attr('src', src.replace("//jpnpubupfr.sojump.com", "//jpnpubupref.sojump.com")).attr('olddomain', '//jpnpubupfr.sojump.com');
                }
            });
            var ignoreEs = $('[dignore="1"]:visible');
            downloadHideElementsArr.push(ignoreEs);
            ignoreEs.hide();

            handleTableScoll.before();

            $('[testexport="1"]').each(function (index) {
                elements.push($(this)[0]);
            });
            if (elements.length <= 0) {
                $('[export="1"]').each(function (index) {
                    var tagName = $(this)[0].tagName;
                    if (tagName.toLowerCase() == "iframe") {
                        var iframeDom = $(this)[0].contentDocument;
                        $(iframeDom).find('[export="1"]').each(function () {
                            elements.push($(this)[0]);
                        });
                        var ignoreEsIframe = $(iframeDom).find('[dignore="1"]:visible');
                        downloadHideElementsArr.push(ignoreEsIframe);
                        ignoreEsIframe.hide();
                    }
                    else {
                        elements.push($(this)[0]);
                    }
                });
            }

            if (elements.length == 0) {
                closeLayer();
                return false;
            }
            totalECount = elements.length;
            getCanvas(elements[0]);
        });
    }

    function getCanvas(element) {
        html2canvas(element, {
            useCORS: true,
            scale: 2,
            imageTimeout: 0,
            ignoreElements: function (eee) {
                return $(eee).attr("pdfignore") == "1"; //只会打印忽略;
            },
            onclone: function (cloneDom) {
                if (isIE()) {
                    var svgElems = $(cloneDom).find('svg');
                    svgElems.each(function (index, node) {
                        var parentNode = node.parentNode;
                        var xmlserializer = new XMLSerializer();
                        var svg_string = (node.outerHTML || xmlserializer.serializeToString(node)).trim();

                        var canvas = document.createElement('canvas');
                        canvgv2(canvas, svg_string);
                        parentNode.removeChild(node);
                        parentNode.appendChild(canvas);
                    });
                }


            }
        }).then(function (canvas) {
            var padTop = $(element).attr("export-padding-top");
            if (!padTop) {
                padTop = 10;
            }
            canvasArr.push({ c: canvas, pt: padTop });
            elements.splice(0, 1);
            elementsArr.push(element);
            if (elements.length > 0) {
                var process = 0;
                if (totalECount > 0) {
                    process = ((totalECount - elements.length) / totalECount) * 100;
                    process = parseInt(process);
                    $('#spanExportProcessText').html(process + '%');
                }
                //if (canvasArr.length < 5) {
                getCanvas(elements[0]);
            }
            else {
                $('#spanExportProcessText').html('99.5%');
                $(".arrge i").show();
                if (coreByPage.needByPage()) {
                    loadCanvasCompleteCallBackForPage();
                }
                else {
                    loadCanvasCompleteCallBack();
                }

            }
        });
    }
    function loadCanvasCompleteCallBack() {
        var arr = canvasArr;
        for (var ii = 0; ii < arr.length; ii++) {
            var canvas = arr[ii].c;
            var paddingTop = arr[ii].pt;
            var img = new Image();
            img.width = canvas.width;
            img.height = canvas.height;
            img.src = canvas.toDataURL('image/jpeg', 1.0);
            imgArr[ii] = { img: img, pt: paddingTop };

            var a4Width = 575.28;
            var pageHeight = 5000;

            if (imgArr.length == arr.length) { // 当所有图片都转化完毕，则进行保存操作
                var pageDatas = [];
                var pageItems = [];
                var tHeight = 0;
                for (var i = 0; i < imgArr.length; i++) {
                    var canvasWidth = imgArr[i].img.width;
                    var canvasHeight = imgArr[i].img.height;
                    var pageData = imgArr[i].img.src;
                    var pTop = imgArr[i].pt;
                    var imgHeight = 0;
                    if (canvasWidth > 0 && canvasHeight > 0) {
                        imgHeight = a4Width / canvasWidth * canvasHeight;
                    }

                    if (tHeight + imgHeight + pTop > pageHeight) {
                        pageItems.push({ h: tHeight, imgs: pageDatas });
                        pageDatas = [];
                        tHeight = 0;
                    }
                    if (imgHeight > 0) {
                        tHeight = tHeight + imgHeight + pTop;
                        pageDatas.push({ img: pageData, w: a4Width, h: imgHeight, pt: pTop });
                    }

                    if (i == imgArr.length - 1) {
                        if (tHeight > 0) {
                            pageItems.push({ h: tHeight, imgs: pageDatas });
                        }
                    }
                }

                var orientation = "p";
                if (a4Width + 20 > pageItems[0].h + 20) {
                    orientation = 'l'
                }
                var pdf = new jspdf.jsPDF(orientation, 'pt', [a4Width + 20, pageItems[0].h + 20]);

                for (var i = 0; i < pageItems.length; i++) {
                    var pItemImgs = pageItems[i].imgs;
                    if (pItemImgs.length > 0) {
                        var position = 0;
                        for (var j = 0; j < pItemImgs.length; j++) {
                            if (!pItemImgs[j] || !pItemImgs[j].img || pItemImgs[j].h <= 0) continue;
                            position += pItemImgs[0].pt;
                            pdf.addImage(pItemImgs[j].img, 'JPEG', 10, position, pItemImgs[j].w, pItemImgs[j].h);
                            position += pItemImgs[j].h;
                        }
                    }
                    if (i + 1 < pageItems.length) {
                        var orientation = "p";
                        if (a4Width + 20 > pageItems[i + 1].h) {
                            orientation = 'l'
                        }
                        pdf.addPage([a4Width + 20, pageItems[i + 1].h + 20], orientation);
                    }
                }
                if (coreByFill.needByFill()) {
                    coreByFill.completed();
                }
                else {
                    handleWhenCompleteDownload();
                }

                if (options && options.returnblob) {
                    var fileBlob = pdf.output('blob');
                    if (options && options.needLayerDown) {
                        pdfFileUpload(fileBlob, function () {

                        });
                    }
                    else if (options && options.success) {
                        options.success(fileBlob);
                    }
                }
                else {
                    pdf.save(fileName);
                    if (options && options.success) {
                        options.success();
                    }
                }
                closeLayer();

            }
        }
    }

    function loadCanvasCompleteCallBackForPage() {
        var arr = canvasArr;
        for (var ii = 0; ii < arr.length; ii++) {
            var canvas = arr[ii].c;
            var paddingTop = arr[ii].pt;
            var img = new Image();
            img.width = canvas.width;
            img.height = canvas.height;
            img.src = canvas.toDataURL('image/jpeg', 1.0);
            imgArr[ii] = { img: img, pt: paddingTop };

            var imgWidth = 535.28;
            var pageHeight = 841.89;

            if (imgArr.length == arr.length) { // 当所有图片都转化完毕，则进行保存操作
                var orientation = "p";
                var pdf = new jspdf.jsPDF(orientation, 'pt', [595.28, 841.89]);
                for (var i = 0; i < imgArr.length; i++) {
                    var canvasWidth = imgArr[i].img.width;
                    var canvasHeight = imgArr[i].img.height;
                    var pageData = imgArr[i].img.src;
                    var imgHeight = 0;
                    if (canvasWidth > 0 && canvasHeight > 0) {
                        imgHeight = imgWidth / canvasWidth * canvasHeight;
                    }
                    if (imgHeight > 0) {
                        if (imgHeight > pageHeight - 10) {
                            imgHeight = pageHeight - 10;
                        }
                        pdf.addImage(pageData, 'JPEG', 30, 10, imgWidth, imgHeight);
                    }
                    if (i + 1 < imgArr.length) {
                        pdf.addPage([595.28, 841.89], orientation);
                    }
                }

                coreByPage.completed();

                if (options && options.returnblob) {
                    var fileBlob = pdf.output('blob');
                    if (options && options.needLayerDown) {
                        pdfFileUpload(fileBlob, function () {

                        });
                    }
                    else if (options && options.success) {
                        options.success(fileBlob);
                    }
                }
                else {
                    pdf.save(fileName);
                    if (options && options.success) {
                        options.success();
                    }
                }
                closeLayer();

            }
        }
    }

    function handleWhenCompleteDownload() {
        handleTableScoll.after();
        if (downloadHideElementsArr.length > 0) {
            for (var i = 0; i < downloadHideElementsArr.length; i++) {
                var elements = downloadHideElementsArr[i];
                elements.show();
            }
        }
        downloadHideElementsArr = [];
        $('img').each(function () {
            var src = $(this).attr("src");
            var olddomain = $(this).attr("olddomain");
            if (src && src.indexOf('//pubref.paperol.cn') >= 0 && olddomain) {
                $(this).attr('src', src.replace("//pubref.paperol.cn", olddomain)).removeAttr('olddomain');
            }
        });
        $('ww-open-data').each(function () {
            $(this).next().remove();
            $(this).parent().removeAttr('pdf-qywx-name');
            $(this).show();
        });
    }

    function handleQywxTransfer(success, container) {
        var curWWOpenData = window.WWOpenData;
        if (top.WWOpenData) curWWOpenData = top.WWOpenData;
        else if (parent.WWOpenData) curWWOpenData = parent.WWOpenData;
        if (curWWOpenData) {
            curWWOpenData.bindAll(document.querySelectorAll('ww-open-data'));
        }

        if (!curWWOpenData || !curWWOpenData.initCanvas) {
            if (success) {
                success();
            }
            return;
        };
        var items = [];
        var existItems = [];
        var wwEles;
        if (!container) {
            wwEles = $('ww-open-data');
        }
        else {
            wwEles = container.find('ww-open-data');
        }
        wwEles.each(function () {
            var userType = $(this).attr('type');
            var openId = $(this).attr('openid');
            var key = userType + "-" + openId;
            if (!existItems[key]) {
                items.push({ type: userType, id: openId });
                existItems[key] = true;
            }
            $(this).parent().attr('pdf-qywx-name', key);
        });
        curWWOpenData.initCanvas();
        curWWOpenData.enableCanvasSharing();
        var itemobj = { items: items };
        curWWOpenData.prefetch(itemobj, function (err, data) {
            if (data && data.items && data.items.length > 0) {
                var qywxArr = [];
                for (var i = 0; i < data.items.length; i++) {
                    var item = data.items[i];
                    var key = item.type + "-" + item.id;
                    qywxArr[key] = item;
                }
                wwEles.each(function () {
                    var key = $(this).parent().attr('pdf-qywx-name');
                    if (qywxArr[key]) {
                        var width = $(this).width();
                        var height = $(this).height();
                        var color = $(this).css('color');
                        var fs = $(this).css('font-size').replace('px', '');
                        var namecanvas;
                        if (top.wjxqywxtocanvas) {
                            namecanvas = top.wjxqywxtocanvas(qywxArr[key].data, fs, '#000000', width, height);
                        }
                        else {
                            namecanvas = tocanvas(qywxArr[key].data, fs, '#000000', width, height);
                        }
                        $(this).after(namecanvas);
                        $(this).hide();
                    }
                });
            }
            if (success) {
                success();
            }
            console.log(err, data);
        })

        function tocanvas(data, fs, color, w, h) {
            var canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            var ctx = canvas.getContext('2d');
            ctx.font = fs + 'px "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Microsoft YaHei","Microsoft YaHei UI","微软雅黑", sans-serif';
            ctx.fillStyle = color;
            ctx.fillText(data, 0, fs);
            //var base64src = canvas.toDataURL("image/png");
            return canvas;
        }
    }

    var coreByFill = {
        needByFill: function () {
            return $('[export-container="1"]').size() > 0;
        },
        readyElements: function (complete) {
            var container = $('[export-container="1"]');
            var containerTagName = container[0].tagName;
            var containerClass = container.attr('class');
            var containerStyle = container.attr('style');
            var containerExportStyle = container.attr('export-style');
            var containerNewStyle;
            if (containerExportStyle) {
                if (containerStyle) {
                    containerNewStyle = containerStyle + ";" + containerExportStyle;
                }
                else {
                    containerNewStyle = containerExportStyle;
                }
            }
            var tempContainerE = $('<' + containerTagName + '>').attr('class', containerClass).attr('style', containerNewStyle).attr('export-temp-container', '1');
            var templateE = $('<div>').attr('export-temp-item', '1');
            if (options && options.tempItemStyle) {
                templateE.attr('style', options.tempItemStyle);
            }
            if (window.isUsingMarker && $('[export-item-marker="1"]').size() > 0) {
                templateE.append("<div class='divContent_bg'></div>");
            }
            var curItemE;
            container.after(tempContainerE);
            $('[export="1"]:visible,[export="1"][export-force="1"]').each(function (index) {
                var tagName = $(this)[0].tagName;
                if (tagName.toLowerCase() == "iframe") {
                    var iframeDom = $(this)[0].contentDocument;
                    if (!handleIframeStyleSpecial($(this))) {
                        tempContainerE.append($(iframeDom).find('style').clone());
                    }

                    $(iframeDom).find('[export="1"]').each(function () {
                        handleOriginalElement($(this));
                    });
                }
                else {
                    handleOriginalElement($(this));
                }
            });

            if (complete) {
                if (options && options.needRefreshChar) {
                    setTimeout(function () { complete(); }, 1000);
                }
                else {
                    complete();
                }
            }

            function handleIframeStyleSpecial(iframeE) {
                var src = $(iframeE).attr('src').toLowerCase();
                if (src.indexOf('viewcandidateself.aspx') > -1) {
                    var iframeDom = iframeE[0].contentDocument;
                    var styleClone = $(iframeDom).find('style').clone();
                    styleClone.each(function () {
                        var styleE = $(this);
                        var styleHtml = styleE.html();
                        var reg = /.fillet__chart--dataGraph\{[\s\S]*?\}/ig;
                        if (reg.test(styleHtml)) {
                            styleHtml = styleHtml.replace(reg, '');
                            styleE.html(styleHtml);
                        }
                    });
                    tempContainerE.append(styleClone);
                    return true;
                }

                return false;
            }

            function handleOriginalElement(element) {
                var maxHeight = 5000;
                var scollInfo = handleTableScoll.hasScrollElement(element);
                if (scollInfo.result) {
                    element.find('[exportbackup="1"]').each(function () {
                        var curE = $(this);
                        appendToDownContainer(curE)
                    });
                }
                else {
                    appendToDownContainer(element);
                }

                function appendToDownContainer(element) {
                    if (!element.is(":visible") && element.attr("export-force") != 1) return;
                    var needHideE = element.find('[dignore="1"]:visible');
                    needHideE.hide();
                    var curHeight = element.height();
                    needHideE.show();
                    var scollInfo = handleTableScoll.hasScrollElement(element);
                    if (scollInfo && scollInfo.result) {
                        curItemE = templateE.clone();
                        curItemE.css('width', scollInfo.maxWidth);
                        tempContainerE.append(curItemE);

                        cloneAndAppend();

                        curItemE = null;
                        return;
                    }
                    if (!curItemE) {
                        curItemE = templateE.clone();
                        tempContainerE.append(curItemE);
                    }
                    var existHeight = $(curItemE).height();
                    if (existHeight + curHeight > maxHeight) {
                        curItemE = templateE.clone();
                        tempContainerE.append(curItemE);
                    }
                    cloneAndAppend();

                    function cloneAndAppend() {
                        var newE = element.clone();
                        //newE.show();
                        replaceExportStyle(newE);
                        replaceExportClass(newE);

                        newE.find('[export-style]').each(function () {
                            replaceExportStyle($(this));
                        });
                        newE.find('[export-class]').each(function () {
                            replaceExportClass($(this));
                        });

                        var charContainer;
                        var oldCharContainer;
                        if (options && options.needRefreshChar) {
                            if (newE.find('[data-highcharts-chart]').size() > 0) {
                                charContainer = newE.find('[data-highcharts-chart]');
                                oldCharContainer = element.find('[data-highcharts-chart]');
                            }
                            else if (newE.attr('data-highcharts-chart')) {
                                charContainer = newE;
                                oldCharContainer = element;
                            }
                            if (charContainer) {
                                charContainer.removeAttr('data-highcharts-chart');
                                charContainer.empty();
                            }
                        }

                        newE.find('[dignore="1"]').remove();
                        curItemE.append(newE);
                        if (charContainer && oldCharContainer) {
                            if (oldCharContainer.highcharts().userOptions.chart)
                                oldCharContainer.highcharts().userOptions.chart.animation = false;
                            charContainer.highcharts(oldCharContainer.highcharts().userOptions);
                        }

                        function replaceExportStyle(newE) {
                            var exportStyle = newE.attr('export-style');
                            if (exportStyle) {
                                var thisStyle = newE.attr('style');
                                var newStyle;
                                if (thisStyle) {
                                    newStyle = thisStyle + ";" + exportStyle;
                                }
                                else {
                                    newStyle = exportStyle;
                                }
                                newE.attr('style', newStyle);
                            }
                        }
                        function replaceExportClass(newE) {
                            var exportClass = newE.attr('export-class');
                            if (exportClass) {
                                newE.addClass(exportClass);
                            }
                        }
                    }
                }
            }
        },
        execute: function () {
            showLayer();
            $(window).scrollTop(0);
            $('body').css("overflow-Y", "hidden");
            $('body').css("overflow-X", "hidden");
            coreByFill.readyElements(function () {
                if (options && options.afterReadyElements) {
                    options.afterReadyElements();
                }
                $('[export-container="1"]').hide();
                var container = $('[export-temp-container="1"]');
                handleQywxTransfer(function () {
                    container.find('img').each(function () {
                        var src = $(this).attr("src");
                        if (src && src.indexOf('//pubnew.paperol.cn') == 0) {
                            $(this).attr('src', src.replace("//pubnew.paperol.cn", "//pubref.paperol.cn")).attr('olddomain', '//pubnew.paperol.cn');
                        }
                        else if (src && src.indexOf('//pubnewfr.paperol.cn') == 0) {
                            $(this).attr('src', src.replace("//pubnewfr.paperol.cn", "//pubref.paperol.cn")).attr('olddomain', '//pubnewfr.paperol.cn');
                        }
                        else if (src && src.indexOf('//jpnpubup.sojump.com') == 0) {
                            $(this).attr('src', src.replace("//jpnpubup.sojump.com", "//jpnpubupref.sojump.com")).attr('olddomain', '//jpnpubup.sojump.com');
                        }
                        else if (src && src.indexOf('//jpnpubupfr.sojump.com') == 0) {
                            $(this).attr('src', src.replace("//jpnpubupfr.sojump.com", "//jpnpubupref.sojump.com")).attr('olddomain', '//jpnpubupfr.sojump.com');
                        }
                    });

                    if (elements.length <= 0) {
                        container.find('[export-temp-item]').each(function (index) {
                            elements.push($(this)[0]);
                        });
                    }

                    if (elements.length == 0) {
                        closeLayer();
                        return false;
                    }
                    totalECount = elements.length;
                    getCanvas(elements[0]);
                }, container);
            });
        },
        completed: function () {
            $('[export-container="1"]').show();
            $('[export-temp-container="1"]').remove();
        }
    };


    var coreByPage = {
        needByPage: function () {
            return $('[export-page-container="1"]').size() > 0;
        },
        readyElements: async function (complete) {
            var container = $('[export-page-container="1"]');
            var containerTagName = container[0].tagName;
            var containerClass = container.attr('class');
            var containerStyle = container.attr('style');
            var containerExportStyle = container.attr('export-style');
            var containerNewStyle;
            if (containerExportStyle) {
                if (containerStyle) {
                    containerNewStyle = containerStyle + ";" + containerExportStyle;
                }
                else {
                    containerNewStyle = containerExportStyle;
                }
            }
            var tempContainerE = $('<' + containerTagName + '>').attr('class', containerClass).attr('style', containerNewStyle).attr('export-temp-container', '1');
            tempContainerE.addClass('export-temp-container');
            var templateE = $('<div>').attr('export-temp-item', '1');
            if (options && options.tempItemStyle) {
                templateE.attr('style', options.tempItemStyle);
            }
            if (window.isUsingMarker && $('[export-item-marker="1"]').size() > 0) {
                templateE.append("<div class='divContent_bg'></div>");
            }
            var curItemE;
            container.after(tempContainerE);
            var clientWidth = tempContainerE.width();
            var maxHeight = clientWidth / 535.28 * 821.89;
            $('[export-item="1"]:visible,[export-item="1"][export-force="1"]').each(function (index) {
                $(this).find('[export-item="1"]').removeAttr('export-item');
            });
            var exportItemArr = [];
            $('[export-item="1"]:visible,[export-item="1"][export-force="1"]').each(function (index) {
                var tagName = $(this)[0].tagName;
                if (tagName.toLowerCase() == "iframe") {
                    var iframeDom = $(this)[0].contentDocument;
                    $(iframeDom).find('[export-item="1"]').each(function () {
                        exportItemArr.push($(this));
                    });
                }
                else {
                    exportItemArr.push($(this));
                }
            });

            await handleElementItem();
            async function handleElementItem() {
                for (var i = 0; i < exportItemArr.length; i++) {
                    var objItem = exportItemArr[i];
                    await handleOriginalElement(objItem);
                }

                if (complete) {
                    if (options && options.needRefreshChar) {
                        setTimeout(function () { complete(); }, 1000);
                    }
                    else {
                        complete();
                    }
                }
            }

            async function handleOriginalElement(element) {
                await appendToDownContainer(element);
                async function appendToDownContainer(element, complete) {
                    if (!element.is(":visible") && element.attr("export-force") != 1) { if (complete) complete(); return; };
                    var newElement = HandleNewElementBase();
                    if (!curItemE) {
                        curItemE = templateE.clone();
                        tempContainerE.append(curItemE);
                    }
                    var remainE = newElement;
                    for (var i = 0; i < 50; i++) {
                        var result = await AppendToElementCycle(remainE);
                        if (!result) break;
                        remainE = result.remainE;
                    }

                    async function AppendToElementCycle(newE) {
                        curItemE.append(newE);
                        refreshChar(newE);
                        scaleTableElement(newE);
                        var allSplitEs = newE.find('[export-split="1"]');
                        if (allSplitEs.size() > 0) {
                            allSplitEs.each(function () {
                                var thisHeight = $(this).height();
                                if (thisHeight < 30) {
                                    $(this).removeAttr('export-split');
                                    console.log(thisHeight);
                                }
                            });
                        }

                        var imgEs = newE.find('img');
                        var needAsync = imgEs.size() > 0;
                        if (needAsync) {
                            for (var i = 0; i < imgEs.length; i++) {
                                if (!(imgEs[i].src) || imgEs[i].src.length == 0) continue;
                                await loadImg(imgEs[i]);
                            }
                        }
                        return await exeElementAppend();


                        async function exeElementAppend() {
                            var existHeight = $(curItemE).height();
                            if (existHeight <= maxHeight) {
                                return false;
                            }
                            else {
                                var curHeight = newE.height();
                                var remainHeight = maxHeight - existHeight + curHeight;
                                var splitItem = await SplitElement(remainHeight, newE);

                                if (!splitItem || !splitItem.newE) {
                                    newE.remove();
                                    if (curItemE.children().length == 0) {
                                        curItemE.remove();
                                    }
                                    curItemE = templateE.clone();
                                    tempContainerE.append(curItemE);
                                    //curItemE.append(newE);
                                    if (splitItem && splitItem.remainE) {
                                        return { result: true, remainE: splitItem.remainE };
                                    }
                                    else {
                                        curItemE.append(newE);
                                        return false;
                                    }

                                }
                                else {
                                    newE.remove();
                                    if (splitItem.newE) {
                                        curItemE.append(splitItem.newE);
                                    }
                                    if (splitItem.remainE) {
                                        curItemE = templateE.clone();
                                        tempContainerE.append(curItemE);
                                        return { result: true, remainE: splitItem.remainE };
                                    }
                                }
                            }
                        }
                    }

                    function scaleTableElement(newE) {
                        if (newE.find('table').size() > 0 || newE[0].tagName.toLowerCase() == "table") {
                            var isSelf = newE[0].tagName.toLowerCase() == "table";
                            var tableE;
                            var width = clientWidth;
                            if (isSelf) {
                                tableE = newE;
                            }
                            else {
                                tableE = newE.find('table').eq(0);
                                width = newE.width();
                            }
                            var tableWidth = $(tableE).width();
                            if (tableWidth <= 0 || tableWidth <= clientWidth) return;

                            var parentHeight = newE.height();
                            var tableHeight = tableE.height();

                            var scale = width / tableWidth;
                            scale = Math.floor(scale * 1000) / 1000;
                            //if (scale > 0.02) {
                            //    scale -= 0.02;
                            //}
                            tableE.css('transform', 'scale(' + scale + ')');
                            tableE.css('transform-origin', 'left top');
                            newE.css('overflow', 'hidden');
                            if (scale < 0.95 && scale > 0.1) {
                                var scareHeight = tableHeight * scale;
                                if (parentHeight - scareHeight > 30) {
                                    newParentHeight = parentHeight - (tableHeight - scareHeight);
                                    newE.height(newParentHeight);
                                    newE.attr('export-process-scale-table', "1").attr('export-process-scale', scale);
                                }
                            }
                        }
                    }

                    function refreshChar(newE) {
                        var charContainer;
                        var oldCharContainer;
                        if (options && options.needRefreshChar) {
                            if (newE.find('[data-highcharts-chart]').size() > 0) {
                                charContainer = newE.find('[data-highcharts-chart]');
                                oldCharContainer = element.find('[data-highcharts-chart]');
                            }
                            else if (newE.attr('data-highcharts-chart')) {
                                charContainer = newE;
                                oldCharContainer = element;
                            }
                            if (charContainer) {
                                charContainer.removeAttr('data-highcharts-chart');
                                charContainer.empty();
                            }
                        }

                        if (charContainer && oldCharContainer) {
                            if (oldCharContainer.highcharts().userOptions.chart)
                                oldCharContainer.highcharts().userOptions.chart.animation = false;
                            charContainer.highcharts(oldCharContainer.highcharts().userOptions);
                        }
                    }
                }

                function HandleNewElementBase() {
                    var newE = element.clone();
                    if (newE.attr('export-force') == 1) {
                        newE.show();
                    }
                    //newE.show();
                    replaceExportStyle(newE);
                    replaceExportClass(newE);
                    handleTextSplit(newE);

                    newE.find('[export-style]').each(function () {
                        replaceExportStyle($(this));
                    });
                    newE.find('[export-class]').each(function () {
                        replaceExportClass($(this));
                    });

                    newE.find('[dignore="1"]').remove();

                    newE.find('img').each(function () {
                        var src = $(this).attr("src");
                        if (src && src.indexOf('//pubnew.paperol.cn') >= 0) {
                            $(this).attr('src', src.replace("//pubnew.paperol.cn", "//pubref.paperol.cn")).attr('olddomain', '//pubnew.paperol.cn');
                        }
                        else if (src && src.indexOf('//pubnewfr.paperol.cn') >= 0) {
                            $(this).attr('src', src.replace("//pubnewfr.paperol.cn", "//pubref.paperol.cn")).attr('olddomain', '//pubnewfr.paperol.cn');
                        }
                    });
                    if(options)
                        options.transCanvas && options.transCanvas(newE, element);
                    return newE;

                    function replaceExportStyle(newE) {
                        var exportStyle = newE.attr('export-style');
                        if (exportStyle) {
                            var thisStyle = newE.attr('style');
                            var newStyle;
                            if (thisStyle) {
                                newStyle = thisStyle + ";" + exportStyle;
                            }
                            else {
                                newStyle = exportStyle;
                            }
                            newE.attr('style', newStyle);
                        }
                    }
                    function replaceExportClass(newE) {
                        var exportClass = newE.attr('export-class');
                        if (exportClass) {
                            newE.addClass(exportClass);
                        }
                    }
                }

                function handleTextSplit(newE) {
                    var splitTextE = newE.find('[export-split-text]')
                    if (splitTextE.size() <= 0) return;
                    var txtSplitAttr = splitTextE.attr('export-split-text');
                    if (!txtSplitAttr) return;

                    var html = splitTextE.html();
                    if (!html) return;

                    if (html.indexOf(txtSplitAttr) < 0) return;
                    var arr = html.split(txtSplitAttr);
                    if (arr != null && arr.length > 0) {
                        splitTextE.empty();
                        for (var i = 0; i < arr.length; i++) {
                            var itemHtml = arr[i];
                            if (i != arr.length - 1) {
                                itemHtml += txtSplitAttr;
                            }
                            var spanE = $('<span>').html(itemHtml);
                            splitTextE.append(spanE);
                        }
                    }
                }
            }

            function loadImg(img) {
                $(img).removeAttr('loading');
                $(img).removeAttr('decoding');
                var width = $(img).width();
                var height = $(img).height();
                var maxImgHeignt = maxHeight - 40;
                if (height > maxHeight) {
                    var newHeight = maxImgHeignt;
                    var newWidth = newHeight / height * width;
                    $(img).width(newWidth);
                    $(img).height(newHeight);
                }
                var promise = new Promise((resolve, reject) => {
                    img.onload = function () {
                        resolve(img);
                    }
                    img.onerror = function () {
                        resolve(img);
                    }
                });
                img.src = img.src;
                return promise;
            }

            async function SplitElement(remainHeight, newElement) {
                if (newElement.attr('export-whole') == '1') {
                    var result = { newE: null, remainE: newElement.clone() };
                    return result;
                }
                if (newElement.find('[export-split="1"]').size() > 0 || newElement.attr('export-split') == '1') {
                    if (remainHeight < 20) {
                        var result = { newE: null, remainE: newElement.clone() };
                        return result;
                    }
                    return await splitCommomElement(remainHeight, newElement);
                }
                if (newElement.find('table').size() > 0 || newElement[0].tagName.toLowerCase() == "table") {
                    if (remainHeight < 20) {
                        var result = { newE: null, remainE: newElement.clone() };
                        return result;
                    }
                    return await splitTableElement(remainHeight, newElement);
                }

                async function splitCommomElement(remainHeight, newElement, splitAttrName) {
                    if (!splitAttrName) {
                        splitAttrName = 'export-split';
                    }
                    var splitFindAttrName = '[' + splitAttrName + '="1"]';
                    var isSelf = newElement.attr(splitAttrName) == 1;
                    var isTd = newElement.is('td');
                    var splitContainer;
                    if (isSelf) {
                        splitContainer = newElement;
                    }
                    else {
                        splitContainer = newElement.find(splitFindAttrName).eq(0);
                    }
                    if (!splitContainer || splitContainer.size() <= 0) return false;

                    var splitAll = splitContainer.attr('export-split-all') == "1";
                    var newTempElement = newElement.clone();
                    var reminElement = newElement.clone();
                    var newSplitE;
                    var remainSplitE;
                    if (isSelf) {
                        newSplitE = newTempElement;
                        remainSplitE = reminElement;
                    }
                    else {
                        newSplitE = newTempElement.find(splitFindAttrName).eq(0);
                        remainSplitE = reminElement.find(splitFindAttrName).eq(0);
                    }
                    newSplitE.empty();
                    remainSplitE.empty();
                    var childeNodes = splitContainer[0].childNodes;
                    if (!childeNodes || childeNodes.length <= 0) {
                        return false;
                    }

                    var isFill = false;
                    var newECount = 0;
                    var remainECount = 0;

                    var tempTr;
                    if (isTd) {
                        tempTr = newElement.closest('tr').clone();
                        tempTr.find(splitFindAttrName).eq(0).after(newTempElement).remove();
                        newElement.closest('tr').after(tempTr);
                    }
                    else {
                        newElement.after(newTempElement);
                    }


                    var stack = [];
                    for (var i = childeNodes.length - 1; i >= 0; i--) {
                        if (isNotValidNode(childeNodes[i])) continue;
                        var item = {};
                        item.node = childeNodes[i];
                        item.targetNewElement = newSplitE;
                        item.targetRemainElement = remainSplitE;
                        item.index = i;
                        item.level = 1;
                        item.isLast = i == childeNodes.length - 1;
                        item.splitAll = splitAll;
                        stack.push(item);
                    }

                    while (stack.length > 0) {
                        var thisItem = stack.pop();
                        await appendItemOperate(thisItem);
                    }

                    newTempElement.remove();
                    if (tempTr) {
                        tempTr.remove();
                    }
                    var result;
                    if (newECount <= 0) {
                        result = { newE: null, remainE: reminElement };

                    }
                    else if (remainECount <= 0) {
                        result = { newE: newTempElement, remainE: null };
                    }
                    else {
                        result = { newE: newTempElement, remainE: reminElement };
                    }
                    return result;


                    async function appendItemOperate(thisItem) {
                        if (!thisItem.isEndItem) { //不是以结尾节点第二次进来
                            var thisNode = $(thisItem.node).clone();
                            var targetNewElement = thisItem.targetNewElement;
                            var targetRemainElement = thisItem.targetRemainElement;

                            var needSplitHeight = (clientWidth / 535.28 * 821.89) / 3;
                            var nodeName = thisNode[0].nodeName.toLowerCase();

                            var isContinueSplitE = false;
                            var isTable = false;
                            var hasChild = thisNode.children().size() > 0;
                            var splitAllChild = thisItem.splitAll || thisNode.attr('export-split-all') == '1';
                            if (hasChild) {
                                if (splitAllChild) {
                                    isContinueSplitE = true;
                                }
                                else if (thisNode.attr(splitAttrName) == '1') {
                                    isContinueSplitE = true;
                                }
                                else if ((nodeName == "ol" || nodeName == "ul") && thisNode.find('li').size() > 0) {
                                    isContinueSplitE = true;
                                }
                                else if (nodeName == "table" || nodeName == "tbody") {
                                    isTable = true;
                                    isContinueSplitE = true;
                                }
                                else if (nodeName == "div" || nodeName == 'span' || nodeName == "p") {
                                    var thisNodeClone = thisNode.clone();
                                    targetNewElement.append(thisNodeClone);
                                    var height = thisNodeClone.height();
                                    thisNodeClone.remove();
                                    if (height > needSplitHeight) {
                                        isContinueSplitE = true;
                                    }
                                }
                            }
                            var hasChild = false;
                            if (isContinueSplitE) {
                                var cNodes = thisNode[0].childNodes;
                                if (cNodes && cNodes.length > 0) {
                                    var thisNCount = newECount;
                                    var thisRCount = remainECount;
                                    var childNewSplitE = thisNode.clone().empty();
                                    var childRemainSplitE = thisNode.clone().empty();
                                    targetNewElement.append(childNewSplitE);
                                    targetRemainElement.append(childRemainSplitE);


                                    for (var i = cNodes.length - 1; i >= 0; i--) {
                                        if (isNotValidNode(cNodes[i])) continue;

                                        if (!hasChild) {
                                            if (thisItem.isLast) {
                                                var endItem = Object.assign({}, thisItem);
                                                endItem.isEndItem = true;
                                                stack.push(endItem);
                                            }
                                        }
                                        hasChild = true;

                                        var childItem = {};
                                        childItem.node = cNodes[i];
                                        childItem.targetNewElement = childNewSplitE;
                                        childItem.targetRemainElement = childRemainSplitE;
                                        childItem.parentNewElement = targetNewElement;
                                        childItem.parentRemainElement = targetRemainElement;
                                        childItem.thisNCount = thisNCount;
                                        childItem.thisRCount = remainECount;
                                        childItem.index = i;
                                        childItem.level = thisItem.level + 1;
                                        childItem.isLast = i == cNodes.length - 1;
                                        childItem.splitAll = splitAllChild;
                                        stack.push(childItem);
                                    }
                                }
                            }
                            else {
                                await appendItem(thisNode, thisItem);
                            }
                        }
                        if ((!hasChild && thisItem.isLast && thisItem.level > 1) || (thisItem.isEndItem && thisItem.level > 1)) {
                            thisItem.targetNewElement.remove();
                            thisItem.targetRemainElement.remove();
                            if (newECount > thisItem.thisNCount) {
                                thisItem.parentNewElement.append(thisItem.targetNewElement);
                            }
                            if (remainECount > thisItem.thisRCount) {
                                thisItem.parentRemainElement.append(thisItem.targetRemainElement);
                            }
                        }
                    }

                    async function appendItem(thisNode, thisItem) {
                        var jqNode = thisNode;
                        var targetNewElement = thisItem.targetNewElement;
                        var targetRemainElement = thisItem.targetRemainElement;
                        //jqNode, targetNewElement, targetRemainElement, complete
                        if (!isFill) {
                            targetNewElement.append(jqNode);

                            var imgEs = jqNode.find('img');
                            if (jqNode.is('img')) {
                                imgEs = jqNode;
                            }
                            var imgSize = imgEs.size();
                            var needAsync = imgSize > 0;

                            if (needAsync) {
                                for (var i = 0; i < imgEs.length; i++) {
                                    if (!(imgEs[i].src) || imgEs[i].src.length == 0) continue;
                                    await loadImg(imgEs[i]);
                                }
                            }
                            innerExecute();

                            function innerExecute() {
                                var thisHeight = newTempElement.height();
                                if (thisHeight > remainHeight) {
                                    isFill = true;
                                    jqNode.remove();
                                }
                                else {
                                    newECount++;
                                }
                                if (isFill) {
                                    targetRemainElement.append(jqNode);
                                    remainECount++;
                                }
                                //if (complete) complete();
                            }
                        }
                        else {
                            targetRemainElement.append(jqNode);
                            remainECount++;
                        }
                    }

                    function isNotValidNode(node) {
                        var nodeName = node.nodeName;
                        if (nodeName == "#text") {
                            if (node.length <= 0 || node.data == "\n" || (node.data && node.data.trim() === "")) return true;
                        }
                        return false;
                    }
                }

                async function splitTableElement(remainHeight, newElement) {
                    var isSelf = newElement[0].tagName.toLowerCase() == "table";
                    var firstVisibleTable;
                    firstVisibleTable = isSelf ? newElement : newElement.find('table:eq(0)');

                    var firstTrColWidthArr = [];
                    var firstTdE = firstVisibleTable.find('tr:eq(0)');
                    var firstTds = firstTdE.find('th');
                    if (firstTds.size() <= 0) {
                        firstTds = firstTdE.find('td');
                    }
                    firstTds.each(function () {
                        var tdWidth = $(this).width();
                        var widthAttr = $(this).attr('width');
                        if (widthAttr && widthAttr.indexOf('px') > -1) {
                            tdWidth = "C" + widthAttr.replace('px', '');
                        }
                        firstTrColWidthArr.push(tdWidth);
                    });

                    var newTempElement = newElement.clone();
                    var reminElement = newElement.clone();
                    var isScaleTable = false;
                    var tableScale;
                    if (newTempElement.attr('export-process-scale-table') == '1') {
                        newTempElement.css('height', 'auto');
                        isScaleTable = true;
                        tableScale = newTempElement.attr('export-process-scale')
                    }
                    if (reminElement.attr('export-process-scale-table') == '1') {
                        reminElement.css('height', 'auto');
                    }
                    var newTableE;
                    var remainTableE;

                    if (isSelf) {
                        newTempElement.empty();
                        newTableE = newTempElement;
                        remainTableE = reminElement;
                        //remainTableE.find('tr:gt(0)').remove();
                    }
                    else {
                        newTempElement.find('table:gt(0)').remove();
                        newTempElement.find('table:eq(0)').empty();
                        newTableE = newTempElement.find('table:eq(0)');
                        remainTableE = reminElement.find('table:eq(0)');
                    }

                    var needFirstHead = true;
                    if (firstVisibleTable.attr('export-nohead') == "1") {
                        needFirstHead = false;
                    }
                    var minTrCount = 0;
                    if (needFirstHead) minTrCount = 1;
                    if (needFirstHead) {
                        remainTableE.find('tr:gt(0)').remove();
                    }
                    else {
                        remainTableE.find('tr').remove();
                    }

                    newElement.after(newTempElement);

                    var trEArr = [];
                    firstVisibleTable.find('tr').each(function () {
                        var trCloneE = $(this).clone();
                        trEArr.push(trCloneE);
                    });

                    var isFill = false;
                    var newECount = 0;
                    var remainECount = 0;

                    for (var i = 0; i < trEArr.length; i++) {
                        var trE = trEArr[i];
                        await appendTrItem(trE);
                    }
                    return handleWhenAppendComplete();

                    async function appendTrItem(trE) {
                        if (!isFill) {
                            newTableE.append(trE);
                            var imgEs = trE.find('img');
                            var imgSize = imgEs.size();
                            var needAsync = imgSize > 0;

                            if (needAsync) {
                                for (var i = 0; i < imgEs.length; i++) {
                                    if (!(imgEs[i].src) || imgEs[i].src.length == 0) continue;
                                    await loadImg(imgEs[i]);
                                }
                            }
                            await innerExecute();

                            async function innerExecute() {
                                var thisHeight = newTempElement.height();
                                if (isScaleTable) {
                                    thisHeight = thisHeight * tableScale;
                                }
                                var thisTrHeight = trE.height();
                                if (isScaleTable) {
                                    thisTrHeight = thisTrHeight * tableScale;
                                }
                                var rHeight = remainHeight - thisHeight + thisTrHeight;
                                //if (thisTrHeight > maxHeight) {
                                if (thisTrHeight > rHeight && rHeight > maxHeight * 0.3) {
                                    if (remainHeight > 20) {
                                        var result = await handleHighTrElement(rHeight, trE);
                                        if (result) {
                                            return;
                                        }
                                    }
                                }
                                if (thisHeight > remainHeight) {
                                    isFill = true;
                                    trE.remove()
                                }
                                else {
                                    newECount++;
                                }
                                if (isFill) {
                                    remainTableE.append(trE);
                                    remainECount++;
                                }
                            }

                            async function handleHighTrElement(curRemailHeight, trElement) {
                                var splitTdE = trElement.find('td[export-split-td="1"]').eq(0);
                                if (!splitTdE || splitTdE.size() <= 0) return false;

                                var splitItem = await splitCommomElement(curRemailHeight, splitTdE, 'export-split-td');
                                if (!splitItem || !splitItem.newE) {
                                    return false;
                                }
                                else {
                                    var trNewE = trElement.clone();
                                    var trRemainE = trElement.clone();
                                    trRemainE.find('td').empty();
                                    var isSplitTdE = false;
                                    trNewE.find('td').each(function () {
                                        if (!isSplitTdE) {
                                            isSplitTdE = $(this).attr('export-split-td') == '1';
                                            if (isSplitTdE) {
                                                $(this).empty();
                                            }
                                        }
                                    });

                                    trE.remove();
                                    if (splitItem.newE) {
                                        trNewE.find('td[export-split-td="1"]').after(splitItem.newE).remove();
                                        newTableE.append(trNewE);
                                        newECount++;
                                    }
                                    if (splitItem.remainE) {
                                        trRemainE.find('td[export-split-td="1"]').after(splitItem.remainE).remove();
                                        remainTableE.append(trRemainE);
                                        isFill = true;
                                        remainECount++;
                                    }
                                    return true;
                                }
                            }

                        }
                        else {
                            remainTableE.append(trE);
                            remainECount++;
                        }
                    }

                    function handleWhenAppendComplete() {
                        if (isScaleTable) {
                            var containerHeight = newTempElement.height();
                            var tableHeight = newTempElement.find('table').height();
                            var tableScaleHeight = tableHeight * tableScale;
                            var scaleContainerHeight = tableScaleHeight;
                            if (containerHeight > tableHeight) {
                                scaleContainerHeight = containerHeight - tableHeight + scaleContainerHeight;
                            }
                            newTempElement.height(scaleContainerHeight);
                        }
                        newTempElement.remove();
                        var result;
                        if (newECount <= minTrCount) {
                            if (needFirstHead && newECount == 0 && reminElement.find('tr').size() >= 2) {
                                reminElement.find('tr:eq(0)').remove();
                            }
                            result = { newE: null, remainE: reminElement };
                            //complete(result);
                            return result;
                        }
                        newTempElement.find('tr:eq(0)').children().each(function (colIndex) {
                            if (firstTrColWidthArr.length > colIndex) {
                                var tdWidthSet = $(this).attr('width');
                                var needSetWidth = !tdWidthSet || (tdWidthSet.indexOf('%') == -1 && tdWidthSet.indexOf('px') == -1);
                                if (needSetWidth) {
                                    var firstWidth = firstTrColWidthArr[colIndex] + "";
                                    if (firstWidth.indexOf('C') == 0) {
                                        $(this).attr('width', firstWidth.replace('C', '') + 'px');
                                    } else {
                                        $(this).width(firstWidth);
                                    }
                                }
                            }
                        });
                        reminElement.find('tr:eq(0)').children().each(function (colIndex) {
                            if (firstTrColWidthArr.length > colIndex) {
                                var tdWidthSet = $(this).attr('width');
                                var needSetWidth = !tdWidthSet || (tdWidthSet.indexOf('%') == -1 && tdWidthSet.indexOf('px') == -1);
                                if (needSetWidth) {
                                    var firstWidth = firstTrColWidthArr[colIndex] + "";
                                    if (firstWidth.indexOf('C') == 0) {
                                        $(this).attr('width', firstWidth.replace('C', '') + 'px');
                                    } else {
                                        $(this).width(firstWidth);
                                    }
                                }
                            }
                        });
                        if (remainECount <= 0 || reminElement.find('tr').size() <= minTrCount) {
                            result = { newE: newTempElement, remainE: null };
                            //complete(result);
                            return result;
                        }
                        result = { newE: newTempElement, remainE: reminElement };
                        //if (complete) {
                        //    complete(result);
                        //}
                        return result;
                    }
                }
            }
        },
        execute: function () {
            showLayer();
            if (options && options.downloadBefore) {
                options.downloadBefore();
            }
            $(window).scrollTop(0);
            $('body').css("overflow-Y", "hidden");
            $('body').css("overflow-X", "hidden");
            coreByPage.readyElements(function () {
                if (options && options.afterReadyElements) {
                    options.afterReadyElements();
                }
                $('[export-page-container="1"]').hide();
                var container = $('[export-temp-container="1"]');
                if (window.isUsingMarker && $('[export-item-marker="1"]').size() > 0) {
                    container.find(".divContent_bg").css("background-image", $('[export-item-marker="1"]').css("background-image"));
                }
                handleQywxTransfer(function () {
                    if (elements.length <= 0) {
                        container.find('[export-temp-item]').each(function (index) {
                            elements.push($(this)[0]);
                        });
                    }
                    if (elements.length == 0) {
                        closeLayer();
                        return false;
                    }
                    totalECount = elements.length;
                    getCanvas(elements[0]);
                }, container);
            });
        },
        completed: function () {
            $('[export-page-container="1"]').show();
            $('[export-temp-container="1"]').remove();
        },
        preview: async function () {
            await coreByPage.readyElements(function () {
                if (options && options.afterReadyElements) {
                    options.afterReadyElements();
                }
                $('[export-page-container="1"]').hide();
                var container = $('[export-temp-container="1"]');
                handleQywxTransfer(function () {
                }, container);
            });
        }
    }

    if (options && options.needLayerDown) {
        options.returnblob = true;
    }
    if (options && options.preview) {
        coreByPage.preview();
    }
    else if (options && options.preview2) {
        coreByPageOld.preview();
    }
    else if (coreByPage.needByPage()) {
        coreByPage.execute();
    }
    else if (coreByFill.needByFill()) {
        coreByFill.execute();
    } else {
        core();
    }
}

function pdfFileUpload(blob, success) {
    if (!window.activityId || window.activityId <= 0) {
        alert("缺失参数,无法下载");
        return;
    }
    var fileName = '';
    $.getJSON('/wxloj/getoss.ashx?activity=' + activityId, function (json) { //签名用的PHP
        var g_object_name = json.dir;
        var policyBase64 = json.policy;
        var signature = json.signature;
        var accessid = json.accessid;
        var fileType = blob.type;
        var timestamp = Date.parse(new Date()) / 1000;
        if (blob) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                //console.log(xhr);
                if (xhr.status === 200) {
                    showDownLinkLayer();
                    var domain = domain_pubref + "/";
                    fileName = domain + g_object_name + filename;
                    $('#_pdfDownMobileLinkValue').val(fileName);
                    $('.pdf-down-mobile-link-copy-area .bottom_control a.wjxui-btn-primary').attr('href', fileName);
                    console.log(fileName);
                    initCopyLink();
                    if (success) success();
                }
                else {
                    alert("下载存在问题，可能是您在页面停留太久的原因，建议刷新页面后再进行尝试。");
                    if (success) success();
                }
            };
            xhr.onerror = function () {
                alert("cannot connect to server.");
                if (success) success();
            };

            filename = activityId + "_" + timestamp + random_string(6) + '.pdf';

            var formdata = new FormData();
            formdata.append("name", filename)
            formdata.append("key", g_object_name + filename);
            formdata.append("policy", policyBase64);
            formdata.append("OSSAccessKeyId", accessid);
            formdata.append("success_action_status", "200");
            formdata.append("signature", signature);
            formdata.append("content-type", fileType);
            formdata.append("file", blob, filename);
            xhr.open("POST", domain_pubali, true);
            xhr.send(formdata);
        }
    });

    function showDownLinkLayer() {
        var width = $(window).width() * 0.9 + 'px';
        layer.open({ type: 1, title: false, area: [width, "200px"], content: getDownLayerDom() });
    }

    function getDownLayerDom() {
        var s = '<div class="pdf-down-mobile-link-copy-area">';
        s += '<div style="display: flex;margin-top: 40px;justify-content: space-around;align-items:center;color:#393939;">';
        s += '<span>链接</span>';
        s += '<textarea id="_pdfDownMobileLinkValue" style="width: 80%;border: 1px solid #ccc;padding: 6px;color: #666;"></textarea>';
        s += '</div>';
        s += '<div style="margin:10px 0 0 60px;">提示：链接只保存七天，请下载保存</div>';
        s += '<div class="bottom_control" style="position: absolute; bottom: 0; width: 100%; background:#fff !important;justify-content: flex-end;border-top: 1px solid #F5F5F5;padding: 8px;">';
        s += '<a id="_pdfDownMobileLinkCopy" href="javascript:; " data-clipboard-target="#_pdfDownMobileLinkValue" class="wjxui-btn">复制</a>';
        s += '<a href="javascript:; " class="wjxui-btn wjxui-btn-primary" style="margin-left:8px;background-color: #fff;color: #262626 !important;border: 1px solid #E8E8E8;">打开</a>';
        s += '</div></div>';
        return s;
    }

    function random_string(len) {
        len = len || 32;
        var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        var maxPos = chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }

    function initCopyLink() {
        try {
            var clipboard = new Clipboard('#_pdfDownMobileLinkCopy');
            clipboard.on('success', function (e) {
                layer.msg("复制成功");
                $('#_pdfDownMobileLinkValue').blur();
            });
            clipboard.on('error', function (e) {
                alertNew("复制失败，请手动复制！");
            });
        } catch (ex) {
            alertNew("复制失败，请手动复制！");
        }
    }
}



function loadScript(url, obj) {
    callback = typeof callback === 'function' ? callback : function () { };
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onreadystatechange = script.onerror = function () {
        //if (this.readyState == "loaded" || this.readyState == "complete") {
        //    callback();
        //}
        if (!this.readyState || ((this.readyState === 'loaded' || this.readyState === 'complete') && !window[obj])) {
            if (obj == "jspdf")
                loadScript("//image.wjx.cn/js/plugin/jspdf.umd.min.js");
        }
    }
    //script.onload = callback;
    var doc = document;
    //if (window != window.top)
    //    doc = parent.document;
    doc.body.appendChild(script);
}
var isLoadPdfJsData = false;
function loadPdfJsData() {
    if (isLoadPdfJsData) return;
    loadScript("//image.wjx.cn/js/plugin/rgbcolor.min.js");
    loadScript("//image.wjx.cn/js/plugin/canvg.js");
    if (window.use141html2canvas) {
        loadScript((window.ExternalCdnDomain || "https://image.wjx.cn/cdn") + '/html2canvas/1.4.1/html2canvas.min.js', "html2canvas");
    }
    else {
        loadScript('//image.wjx.cn/js/plugin/html2canvas.min.js', "html2canvas");
    }
    //loadScript('//cdn.staticfile.org/html2canvas/1.4.1/html2canvas.min.js', "html2canvas");

    loadScript((window.ExternalCdnDomain || "https://image.wjx.cn/cdn") + "/jspdf/2.5.1/jspdf.umd.min.js", "jspdf");

    isLoadPdfJsData = true;
    //loadScript("/js/plugin/FileSaver.js");
}
if (window.location.href.indexOf('pdfbatchdown=1') > -1) {
    loadPdfJsData();
}

function waitLoadPdfJsComplete(success) {
    var isComplete = false;
    var curInterval = null;
    curInterval = setInterval(function () {
        if (window.html2canvas && !window.isLoadingSwotData) {
            isComplete = true;
        }
        if (isComplete) {
            clearInterval(curInterval);
            if (success) success();
        }
    }, 100);
}

function getSafeFileName(fileName) {
    var regex = /[\.<>|\s\\\'\b\0\t\n]+/ig;
    fileName = fileName.replace(regex, '');
    return fileName;
}