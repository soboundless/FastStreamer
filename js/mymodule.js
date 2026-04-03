document.write("<script language=javascript src='../lib/layui/layui.js'></script>")

/* function dateFormat(format, date) {
    if (!format) return '';
    date = date || new Date();
    let dateMap = {
        y: date.getFullYear(),
        M: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds(),
        S: date.getMilliseconds()
    };
    return format.replace(/(y+)|(M+)|(d+)|(h+)|(m+)|(s+)|(S+)/g, (a) => _add0(dateMap[a[0]], a.length))
}

function _add0(time, len) {
    time = time.toString();
    let l = time.length;
    return l < len ? '0'.repeat(len - l) + time : time;
} */

function addSelectToBox(selectID, fieldName, tableName) {
    var $ = layui.jquery;
    $.ajax({
        url: '../../../api/getTableField?fieldName=' + fieldName + '&tableName=' + tableName + '&page=1&limit=10000',
        type: 'get',
        data: {},
        dataType: "json",
        async: false,
        success: function (result) {
            console.log(result);
            if (result.code === 0) {
                $.each(result.data, function (index, value) {
                    var jkname = eval('value.' + fieldName);//字符串转变量名
                    $('#' + selectID).append(new Option(jkname, jkname));
                })
            };
        }
    });
}
/*** 取时间文本字符串格式为2026-01-01 12:50:00 */
function generateTimestamp() {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var seconds = String(now.getSeconds()).padStart(2, '0');
    return year + month + day + hours + minutes + seconds;
}

/**
 * layui表格导出Excel表格
 * @param {Array} tablecols - 表格列配置数组
 * @param {String} apiUrl - 数据接口地址
 * @param {Object} searchData - 查询条件JSON对象
 * @param {Number} limit - 导出记录笔数（可选，默认10000）
 * @param {String} fileName - Excel文件名（不含扩展名）
 * @param {String} sheetName - Excel工作表名（可选，默认与文件名相同）
 */
function exportExcel(tablecols, apiUrl, searchData, limit, fileName, sheetName) {
    var layer = layui.layer;
    var $ = layui.jquery;

    limit = limit || 10000;
    sheetName = sheetName || fileName;

    layer.load(1);
    console.log('导出搜索条件:', JSON.stringify(searchData));

    $.ajax({
        url: apiUrl,
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
            page: 1,
            limit: limit,
            ...searchData
        }),
        dataType: 'json',
        success: function (res) {
            console.log('导出返回数据:', res);
            layer.closeAll('loading');
            if (res.code === 0 && res.data && res.data.length > 0) {
                var exportData = [];
                var headers = [];
                var colWidths = [];
                for (var i = 1; i < tablecols.length - 1; i++) {
                    headers.push(tablecols[i].title);
                    var width = tablecols[i].excelWidth || Math.round((tablecols[i].minWidth || tablecols[i].minwidth || 120) / 10);
                    colWidths.push({ wch: width });
                }
                exportData.push(headers);
                layui.each(res.data, function (index, item) {
                    var row = [];
                    for (var i = 1; i < tablecols.length - 1; i++) {
                        var field = tablecols[i].field;
                        row.push(item[field] || '');
                    }
                    exportData.push(row);
                });
                var ws = XLSX.utils.aoa_to_sheet(exportData);
                ws['!cols'] = colWidths;
                var wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, sheetName);
                var timeStr = generateTimestamp();
                XLSX.writeFile(wb, fileName + '_' + timeStr + '.xlsx');
                layer.msg('导出成功', { icon: 1 });
            } else {
                layer.msg('暂无数据可导出', { icon: 2 });
            }
        },
        error: function () {
            layer.closeAll('loading');
            layer.msg('导出失败，请稍后重试', { icon: 2 });
        }
    });
}
/*
$.ajax({
url: '../../../api/getTableField?fieldName=FWLX&tableName=Com_Line&page=1&limit=10000',
type: 'get',
data: {},
dataType: "json",
async: false,
success: function (result) {
console.log(result);
if (result.code === 0) {
$.each(result.data, function (index, value) {
$('#FWLX').append(new Option(value.FWLX, value.FWLX));
console.log(value.ZT);
})
};
layui.form.render();
}
}); */

// Excel日期序列号转换函数
function excelSerialToDate(serial) {
    // Excel日期序列号转换为JavaScript日期
    // Excel序列号1对应1900年1月1日
    // 修正Excel的1900年闰年错误
    if (serial <= 60) {
        // 对于序列号1-60，直接计算
        var date = new Date(1899, 11, 31); // 1899年12月31日
        date.setDate(date.getDate() + serial);
    } else {
        // 对于序列号61及以上，需要减去1天（因为Excel错误地认为1900年是闰年）
        var date = new Date(1899, 11, 31); // 1899年12月31日
        date.setDate(date.getDate() + serial - 1);
    }
    return date;
}

// 日期格式化函数
function formatDate(date) {
    // 将日期对象格式化为yyyy-mm-dd格式
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
}

// 验证字符串是否为纯数字
function validateStringNumber(str) {
    var reg = /^\d+$/;
    return reg.test(str);
}

// 验证日期字符串是否为yyyy-mm-dd格式
function validateDate(dateStr) {
    var reg = /^\d{4}-\d{2}-\d{2}$/;
    if (!reg.test(dateStr)) {
        return false;
    }
    var parts = dateStr.split('-');
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var day = parseInt(parts[2], 10);

    if (month < 1 || month > 12) {
        return false;
    }

    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        daysInMonth[1] = 29;
    }

    if (day < 1 || day > daysInMonth[month - 1]) {
        return false;
    }

    var date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

// 验证值是否为"是"或"否"
function validateIsBx(value) {
    return value === '是' || value === '否';
}

// 验证证件号码是否符合要求
function validateHolderno(str) {
    var reg = /^[a-zA-Z0-9]+$/;
    return reg.test(str) && str.length === 18;
}

// 验证无人机序号是否符合要求
function validateWrjsn(str) {
    var reg = /^[a-zA-Z0-9]+$/;
    return reg.test(str);
}

/**
 * 通用Excel数据校验函数
 * @param {Array} files - 文件数组，包括excel表格和所有要上传的图片
 * @param {Array} fieldConfig - 字段配置数组，每个元素包含：
 *   - name: json字段英文名称
 *   - label: json字段中文名称
 *   - limit: 限制标记(0表示无限制,1表示限制为数字,2表示限制为英文大小写加数字,3表示限制为日期格式yyyy-mm-dd,4表示为图片列,5表示逻辑列只能填'是'或'否')
 *   - length: 最小长度和最大长度数组[minLength, maxLength], 0表示不限制
 * @param {String} logPageId - 日志显示的页面ID
 * @param {String} validateApi - 在线校验的接口地址
 * @returns {Array|null} - 校验通过返回准备上传的json数组，校验不通过返回null
 */
function validateExcelData(files, fieldConfig, logPageId, validateApi) {
    var layer = layui.layer;
    var $ = layui.jquery;
    
    // 存储选择的文件，key为文件名，value为File对象
    var selectedFiles = {};
    var excelFile = null;
    var excelFileCount = 0;
    
    // 遍历选择的文件
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var fileName = file.name;
        var fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
        
        // 存储文件到selectedFiles对象
        selectedFiles[fileName] = file;
        
        // 判断文件类型
        if (fileExt === '.xlsx') {
            excelFileCount++;
            excelFile = file;
        }
    }
    
    // 检查是否选择了Excel文件
    if (!excelFile) {
        layer.msg('请选择.xlsx格式的文件', { icon: 2 });
        return null;
    }
    
    // 检查是否选择了多个Excel文件
    if (excelFileCount > 1) {
        layer.msg('您选择了多个Excel文件，请只选择一个Excel文件重新选择', { icon: 2 });
        return null;
    }
    
    // 读取Excel文件
    var reader = new FileReader();
    var validatedData = [];
    var hasError = false;
    
    // 使用Promise处理异步读取
    return new Promise(function(resolve, reject) {
        reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            var workbook;
            
            try {
                workbook = XLSX.read(data, { type: 'array' });
            } catch (error) {
                layer.msg('文件解析失败，请检查文件格式', { icon: 2 });
                resolve(null);
                return;
            }
            
            var firstSheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[firstSheetName];
            
            var jsonData;
            try {
                jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            } catch (error) {
                layer.msg('数据转换失败，请检查文件内容', { icon: 2 });
                resolve(null);
                return;
            }
            
            // 检查数据行数
            if (jsonData.length <= 2) {
                layer.msg('记录行数为0', { icon: 2 });
                resolve(null);
                return;
            }
            
            // 检查列数
            var firstRow = jsonData[0];
            if (firstRow.length !== fieldConfig.length) {
                layer.msg('表格排版不符合要求，列数必须是' + fieldConfig.length + '列', { icon: 2 });
                resolve(null);
                return;
            }
            
            // 显示校验进度
            var resultHtml = '<p style="color: #2c5f7d; font-weight: bold;">开始数据校验...</p>';
            resultHtml += '<p style="color: #666;">共 ' + (jsonData.length - 2) + ' 条数据待校验</p>';
            resultHtml += '<div id="validateProgress" style="margin-top: 10px;"></div>';
            $('#' + logPageId).html(resultHtml);
            
            var validatedData = [];
            var hasError = false;
            var errorMessages = [];
            
            // 异步遍历数据行进行校验
            function validateNextRow(i) {
                if (i < jsonData.length) {
                    var rowData = jsonData[i];
                    if (!rowData || rowData.length === 0) {
                        // 跳过空行，继续校验下一行
                        setTimeout(function() {
                            validateNextRow(i + 1);
                        }, 0);
                        return;
                    }
                    
                    // 更新校验进度
                    var progressHtml = '<p style="color: #666;">正在校验第 ' + (i - 1) + '/' + (jsonData.length - 2) + ' 条数据...</p>';
                    $('#validateProgress').html(progressHtml);
                    
                    // 滚动到底部，确保用户能够看到最新的校验进度
                    var resultArea = $('#' + logPageId);
                    resultArea.scrollTop(resultArea[0].scrollHeight);
                    
                    var jsonItem = {};
                    var rowValid = true;
                    
                    // 遍历每一列进行校验
                    for (var j = 0; j < fieldConfig.length; j++) {
                        var fieldName = fieldConfig[j].name;
                        var fieldLabel = fieldConfig[j].label;
                        var fieldLimit = fieldConfig[j].limit;
                        var fieldLength = fieldConfig[j].length || [0, 0];
                        var minLength = fieldLength[0] || 0;
                        var maxLength = fieldLength[1] || 0;
                        
                        var value = rowData[j];
                        value = value !== undefined && value !== null ? String(value).replace(/^\s+|\s+$/g, '') : '';
                        
                        // 检查最小长度
                        if (minLength > 0 && value.length < minLength) {
                            var errorMsg = '第' + (i + 1) + '行第' + (j + 1) + '列字段【' + fieldLabel + '】至少要输入' + minLength + '个字符';
                            console.log(errorMsg);
                            resultHtml += '<p style="color: #FF5722;">校验失败：' + errorMsg + '</p>';
                            $('#' + logPageId).html(resultHtml);
                            hasError = true;
                            errorMessages.push(errorMsg);
                            rowValid = false;
                            break;
                        }
                        
                        // 检查最大长度
                        if (maxLength > 0 && value.length > maxLength) {
                            var errorMsg = '第' + (i + 1) + '行第' + (j + 1) + '列字段【' + fieldLabel + '】长度不能大于' + maxLength + '个字符';
                            console.log(errorMsg);
                            resultHtml += '<p style="color: #FF5722;">校验失败：' + errorMsg + '</p>';
                            $('#' + logPageId).html(resultHtml);
                            hasError = true;
                            errorMessages.push(errorMsg);
                            rowValid = false;
                            break;
                        }
                        
                        // 根据限制标记进行校验
                        switch (fieldLimit) {
                            case 1: // 限制为数字
                                if (!validateStringNumber(value)) {
                                    var errorMsg = '第' + (i + 1) + '行第' + (j + 1) + '列字段【' + fieldLabel + '】必须为数字';
                                    console.log(errorMsg);
                                    resultHtml += '<p style="color: #FF5722;">校验失败：' + errorMsg + '</p>';
                                    $('#' + logPageId).html(resultHtml);
                                    hasError = true;
                                    errorMessages.push(errorMsg);
                                    rowValid = false;
                                    break;
                                }
                                break;
                            case 2: // 限制为英文大小写加数字
                                if (!/^[a-zA-Z0-9]+$/.test(value)) {
                                    var errorMsg = '第' + (i + 1) + '行第' + (j + 1) + '列字段【' + fieldLabel + '】只能填英文大小写和数字';
                                    console.log(errorMsg);
                                    resultHtml += '<p style="color: #FF5722;">校验失败：' + errorMsg + '</p>';
                                    $('#' + logPageId).html(resultHtml);
                                    hasError = true;
                                    errorMessages.push(errorMsg);
                                    rowValid = false;
                                    break;
                                }
                                break;
                            case 3: // 限制为日期格式yyyy-mm-dd
                                // 检查是否为Excel日期序列号（纯数字且在合理范围内）
                                if (/^\d+$/.test(value)) {
                                    var serial = parseFloat(value);
                                    // Excel日期序列号范围通常在1到60000之间
                                    if (serial >= 1 && serial <= 60000) {
                                        var dateObj = excelSerialToDate(serial);
                                        value = formatDate(dateObj);
                                    }
                                }
                                
                                if (!validateDate(value)) {
                                    var errorMsg = '第' + (i + 1) + '行第' + (j + 1) + '列字段【' + fieldLabel + '】格式不正确，应为yyyy-mm-dd';
                                    console.log(errorMsg);
                                    resultHtml += '<p style="color: #FF5722;">校验失败：' + errorMsg + '</p>';
                                    $('#' + logPageId).html(resultHtml);
                                    hasError = true;
                                    errorMessages.push(errorMsg);
                                    rowValid = false;
                                    break;
                                }
                                break;
                            case 4: // 图片列
                                if (value !== '') {
                                    // 检查是否选择了对应的图片文件
                                    var imgFile = selectedFiles[value];
                                    if (!imgFile) {
                                        var errorMsg = '第' + (i + 1) + '行第' + (j + 1) + '列字段【' + fieldLabel + '】对应的文件未选择';
                                        console.log(errorMsg);
                                        resultHtml += '<p style="color: #FF5722;">校验失败：' + errorMsg + '</p>';
                                        $('#' + logPageId).html(resultHtml);
                                        hasError = true;
                                        errorMessages.push(errorMsg);
                                        rowValid = false;
                                        break;
                                    }
                                    
                                    // 检查文件扩展名是否为图片格式
                                    var imgExt = imgFile.name.substring(imgFile.name.lastIndexOf('.')).toLowerCase();
                                    var validImgExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
                                    if (!validImgExts.includes(imgExt)) {
                                        var errorMsg = '第' + (i + 1) + '行第' + (j + 1) + '列字段【' + fieldLabel + '】不是有效的图片格式，只支持jpg、jpeg、png、gif、bmp';
                                        console.log(errorMsg);
                                        resultHtml += '<p style="color: #FF5722;">校验失败：' + errorMsg + '</p>';
                                        $('#' + logPageId).html(resultHtml);
                                        hasError = true;
                                        errorMessages.push(errorMsg);
                                        rowValid = false;
                                        break;
                                    }
                                    
                                    // 检查文件大小是否超过3M
                                    var maxSize = 3 * 1024 * 1024; // 3MB
                                    if (imgFile.size > maxSize) {
                                        var errorMsg = '第' + (i + 1) + '行第' + (j + 1) + '列字段【' + fieldLabel + '】文件大小超过3M';
                                        console.log(errorMsg);
                                        resultHtml += '<p style="color: #FF5722;">校验失败：' + errorMsg + '</p>';
                                        $('#' + logPageId).html(resultHtml);
                                        hasError = true;
                                        errorMessages.push(errorMsg);
                                        rowValid = false;
                                        break;
                                    }
                                }
                                break;
                            case 5: // 逻辑列，只能填'是'或'否'
                                if (value !== '是' && value !== '否') {
                                    var errorMsg = '第' + (i + 1) + '行第' + (j + 1) + '列字段【' + fieldLabel + '】只能填"是"或"否"';
                                    console.log(errorMsg);
                                    resultHtml += '<p style="color: #FF5722;">校验失败：' + errorMsg + '</p>';
                                    $('#' + logPageId).html(resultHtml);
                                    hasError = true;
                                    errorMessages.push(errorMsg);
                                    rowValid = false;
                                    break;
                                }
                                break;
                        }
                        
                        if (!rowValid) {
                            break;
                        }
                        
                        // 设置json字段值
                        jsonItem[fieldName] = value;
                    }
                    
                    if (!rowValid) {
                        // 继续校验下一行，不直接返回
                        setTimeout(function() {
                            validateNextRow(i + 1);
                        }, 0);
                        return;
                    }
                    
                    // 添加编辑类型和行索引
                    jsonItem.edittype = 'check';
                    jsonItem.rowIndex = i + 1;
                    
                    // 添加到校验通过的数据数组
                    validatedData.push(jsonItem);
                    
                    // 继续校验下一行（使用setTimeout模拟异步，避免页面卡住）
                    setTimeout(function() {
                        validateNextRow(i + 1);
                    }, 0);
                } else {
                    // 本地校验完成，进行在线校验或返回结果
                    if (hasError) {
                        resultHtml = '<p style="color: #FF5722; font-weight: bold;">前端离线校验未通过,请查看失败原因后进行修改</p>';
                        resultHtml += '<p style="color: #666;">共 ' + (jsonData.length - 2) + ' 条数据待校验</p>';
                        resultHtml += '<p style="color: #FF5722;">失败记录数：' + errorMessages.length + ' 条</p>';
                        // 显示具体的错误信息
                        errorMessages.forEach(function(errorMsg, index) {
                            resultHtml += '<p style="color: #FF5722; font-size: 12px;">' + (index + 1) + '. ' + errorMsg + '</p>';
                        });
                        $('#' + logPageId).html(resultHtml);
                        layer.msg('前端离线校验未通过,请查看失败原因后进行修改', { icon: 2 });
                        resolve(null);
                        return;
                    }
                    
                    // 本地校验通过，提示进行后台服务校验
                    resultHtml = '<p style="color: #009688; font-weight: bold;">前端离线校验通过,现在进行后台服务校验</p>';
                    resultHtml += '<p style="color: #666;">共 ' + validatedData.length + ' 条数据待校验</p>';
                    resultHtml += '<div id="validateProgress" style="margin-top: 10px;"></div>';
                    $('#' + logPageId).html(resultHtml);
                    
                    // 在线校验
                    if (validateApi) {
                        var onlineErrorMessages = [];
                        var onlineHasError = false;
                        
                        // 使用异步方式进行在线校验，避免页面卡住
                        function validateNext(index) {
                            if (index >= validatedData.length) {
                                // 所有数据校验完成
                                if (onlineHasError) {
                                    resultHtml = '<p style="color: #FF5722; font-weight: bold;">后台服务校验未通过,请查看失败原因后进行修改</p>';
                                    resultHtml += '<p style="color: #666;">共 ' + validatedData.length + ' 条数据待校验</p>';
                                    resultHtml += '<p style="color: #FF5722;">失败记录数：' + onlineErrorMessages.length + ' 条</p>';
                                    // 显示具体的错误信息
                                    onlineErrorMessages.forEach(function(errorMsg, index) {
                                        resultHtml += '<p style="color: #FF5722; font-size: 12px;">' + (index + 1) + '. ' + errorMsg + '</p>';
                                    });
                                    $('#' + logPageId).html(resultHtml);
                                    layer.msg('后台服务校验未通过,请查看失败原因后进行修改', { icon: 2 });
                                    resolve(null);
                                    return;
                                }
                                
                                // 校验成功
                                resultHtml = '<p style="color: #009688; font-weight: bold;">数据校验通过,现在进行可以开始导入数据了</p>';
                                resultHtml += '<p style="color: #666;">共校验 ' + validatedData.length + ' 条数据</p>';
                                resultHtml += '<p style="color: #666;">请点击[数据导入]按钮导入数据</p>';
                                $('#' + logPageId).html(resultHtml);
                                layer.msg('数据校验通过,现在进行可以开始导入数据了', { icon: 1 });
                                
                                // 存储选择的文件，用于后续上传
                                window.selectedFiles = selectedFiles;
                                
                                resolve(validatedData);
                                return;
                            }
                            
                            var data = validatedData[index];
                            var rowIndex = data.rowIndex;
                            
                            // 更新校验进度
                            var progressHtml = '<p style="color: #666;">正在进行在线校验第 ' + (index + 1) + '/' + validatedData.length + ' 条数据...</p>';
                            $('#validateProgress').html(progressHtml);
                            
                            // 滚动到底部，确保用户能够看到最新的校验进度
                            var resultArea = $('#' + logPageId);
                            resultArea.scrollTop(resultArea[0].scrollHeight);
                            
                            // 异步发送请求
                            $.ajax({
                                url: validateApi,
                                type: 'post',
                                contentType: 'application/json',
                                data: JSON.stringify(data),
                                dataType: 'json',
                                async: true,
                                success: function (result) {
                                    if (result.code !== 0) {
                                        // 校验失败
                                        var validateErrorMsg = result.msg;
                                        var errorMsg = '第' + rowIndex + '行数据校验失败：' + validateErrorMsg;
                                        console.log(errorMsg);
                                        resultHtml += '<p style="color: #FF5722;">校验失败：' + errorMsg + '</p>';
                                        $('#' + logPageId).html(resultHtml);
                                        onlineHasError = true;
                                        onlineErrorMessages.push(errorMsg);
                                        validateNext(index + 1);
                                        return;
                                    }
                                    
                                    // 校验成功，继续校验下一条
                                    validateNext(index + 1);
                                },
                                error: function () {
                                    // 网络错误
                                    var validateErrorMsg = '网络错误';
                                    var errorMsg = '第' + rowIndex + '行数据校验失败：' + validateErrorMsg;
                                    console.log(errorMsg);
                                    resultHtml += '<p style="color: #FF5722;">校验失败：' + errorMsg + '</p>';
                                    $('#' + logPageId).html(resultHtml);
                                    onlineHasError = true;
                                    onlineErrorMessages.push(errorMsg);
                                    validateNext(index + 1);
                                    return;
                                }
                            });
                        }
                        
                        // 开始在线校验
                        validateNext(0);
                        return;
                    }
                    
                    // 没有在线校验接口，直接返回
                    resultHtml = '<p style="color: #009688; font-weight: bold;">数据校验通过,现在进行可以开始导入数据了</p>';
                    resultHtml += '<p style="color: #666;">共校验 ' + validatedData.length + ' 条数据</p>';
                    resultHtml += '<p style="color: #666;">请点击[数据导入]按钮导入数据</p>';
                    $('#' + logPageId).html(resultHtml);
                    layer.msg('数据校验通过,现在进行可以开始导入数据了', { icon: 1 });
                    
                    // 存储选择的文件，用于后续上传
                    window.selectedFiles = selectedFiles;
                    
                    resolve(validatedData);
                }
            }
            
            // 开始本地校验
            validateNextRow(2);
        };
        
        reader.onerror = function () {
            layer.msg('文件读取失败，请重试', { icon: 2 });
            resolve(null);
        };
        
        reader.readAsArrayBuffer(excelFile);
    });
}

/**
 * 通用数据上传函数
 * @param {Array} records - 校验函数返回的json记录
 * @param {String} uploadApi - 上传地址
 * @param {String} imageUploadApi - 图片上传地址
 * @param {String} logPageId - 日志显示的页面ID
 */
function uploadExcelData(records, uploadApi, imageUploadApi, logPageId) {
    var layer = layui.layer;
    var $ = layui.jquery;
    
    if (!records || records.length === 0) {
        layer.msg('没有数据可上传', { icon: 2 });
        return;
    }
    
    // 显示上传进度
    var resultHtml = '<p style="color: #2c5f7d; font-weight: bold;">开始导入数据...</p>';
    resultHtml += '<p style="color: #666;">共 ' + records.length + ' 条数据待导入</p>';
    resultHtml += '<p style="color: #FF9800;">提示：请不要关闭窗口，否则上传会中断</p>';
    resultHtml += '<div id="uploadProgress" style="margin-top: 10px;"></div>';
    $('#' + logPageId).html(resultHtml);
    
    var successCount = 0;
    var failCount = 0;
    var failDetails = [];
    
    // 上传数据
    function uploadData(index) {
        if (index >= records.length) {
            // 上传完成
            var resultHtml = '<p style="color: #009688; font-weight: bold;">数据导入完成！</p>';
            resultHtml += '<p style="color: #666;">成功：' + successCount + ' 条</p>';
            resultHtml += '<p style="color: #FF5722;">失败：' + failCount + ' 条</p>';
            
            if (failCount > 0) {
                resultHtml += '<div style="margin-top: 15px; padding: 10px; background: #fff3e0; border-radius: 4px;">';
                resultHtml += '<p style="color: #FF5722; font-weight: bold; margin-bottom: 10px;">失败记录详情：</p>';
                failDetails.forEach(function (detail) {
                    resultHtml += '<p style="color: #666; margin: 5px 0;">第 ' + detail.row + ' 行：' + detail.msg + '</p>';
                });
                resultHtml += '</div>';
            }
            
            $('#' + logPageId).html(resultHtml);
            layer.msg('数据导入完成', { icon: 1 });
            return;
        }
        
        // 更新上传进度
        var progressHtml = '<p style="color: #666;">正在上传第 ' + (index + 1) + '/' + records.length + ' 条数据...</p>';
        $('#uploadProgress').html(progressHtml);
        
        // 滚动到底部，确保用户能够看到最新的上传进度
        var resultArea = $('#' + logPageId);
        resultArea.scrollTop(resultArea[0].scrollHeight);
        
        var data = records[index];
        data.edittype = 'insert';
        var rowIndex = data.rowIndex;
        
        // 检查是否有图片列
        var hasImage = false;
        var imageField = '';
        var imageValue = '';
        
        for (var field in data) {
            if (data[field] && typeof data[field] === 'string') {
                var imgFile = window.selectedFiles[data[field]];
                if (imgFile) {
                    hasImage = true;
                    imageField = field;
                    imageValue = data[field];
                    break;
                }
            }
        }
        
        // 如果有图片，先上传图片
        if (hasImage) {
            var imgFile = window.selectedFiles[imageValue];
            
            // 构造FormData对象，用于上传文件
            var formData = new FormData();
            formData.append('file', imgFile);
            formData.append('filename', data.wrjsn || '');
            
            // 上传图片
            $.ajax({
                url: imageUploadApi,
                type: 'post',
                contentType: false,
                processData: false,
                data: formData,
                success: function (result) {
                    if (result.code === 0) {
                        // 图片上传成功，更新imgurl为返回的url
                        data[imageField] = result.url;
                        
                        // 上传数据
                        uploadRecord(data, index);
                    } else {
                        // 图片上传失败，记录失败信息
                        failCount++;
                        failDetails.push({
                            row: rowIndex,
                            msg: '图片上传失败：' + result.msg
                        });
                        
                        // 继续上传下一条
                        uploadData(index + 1);
                    }
                },
                error: function () {
                    // 网络错误，记录失败信息
                    failCount++;
                    failDetails.push({
                        row: rowIndex,
                        msg: '图片上传失败：网络错误'
                    });
                    
                    // 继续上传下一条
                    uploadData(index + 1);
                }
            });
        } else {
            // 直接上传数据
            uploadRecord(data, index);
        }
    }
    
    // 上传记录
    function uploadRecord(data, index) {
        var rowIndex = data.rowIndex;
        
        $.ajax({
            url: uploadApi,
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(data),
            dataType: 'json',
            success: function (result) {
                if (result.code === 0) {
                    // 上传成功
                    successCount++;
                } else {
                    // 上传失败，记录失败信息
                    failCount++;
                    failDetails.push({
                        row: rowIndex,
                        msg: result.msg
                    });
                }
                
                // 继续上传下一条
                uploadData(index + 1);
            },
            error: function () {
                // 网络错误，记录失败信息
                failCount++;
                failDetails.push({
                    row: rowIndex,
                    msg: '网络错误'
                });
                
                // 继续上传下一条
                uploadData(index + 1);
            }
        });
    }
    
    // 开始上传
    uploadData(0);
}

