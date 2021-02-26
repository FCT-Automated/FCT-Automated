$(function() {
    var selectElement = document.getElementById('API')
    selectElement.addEventListener('change', (event) => {
        changeAPIForm(document.getElementById('API').value)
    })
    function changeAPIForm(curAPI){
        switch (curAPI) {
            case 'Login':
                $('.field_Login').show()
                $('.field_SetPoints').hide()
                break
            case 'SetPoints':
                $('.field_SetPoints').show()
                $('.field_Login').hide()
                break
            case 'KickOut':
                $('.field_SetPoints').hide()
                $('.field_Login').hide()
                break
        }
        
    }
    
      
})

// $(function() {
//     var $table = $('#dataTable')
//     var $addbutton = $('#addBtn')

//     $addbutton.click(function() {
//         var row = {
//             id: '',
//             gameID: '',
//             betPosition: '',
//             changeBetPosition: '',
//             errorMessagePosition:''
//         }
//         var tablearray = $table.bootstrapTable('getData')
//         if (tablearray.length == 0){
//             row.id = 1
//         }else{
//             row.id = tablearray[0].id+1
//         }

//         $table.bootstrapTable('insertRow', {
//             index: 0,
//             row
//         })
//     })

//     $table.bootstrapTable({
//         toolbar: '#dataTable',
//         uniqueId: 'id',
//         //clickEdit: true,
//         //showToggle: true,
//         pagination: true,       //顯示分頁條
//         //showColumns: true,
//         //showPaginationSwitch: true,     //顯示切換分頁按鈕
//         //showRefresh: true,      //顯示刷新按鈕
//         //clickToSelect: true,  //點擊row選中radio或CheckBox
//         columns: [
//         {
//             field: 'id',
//             //title: '序號',
//             align:"center",
//             valign:"middle"
//         }, {
//             field: 'gameID',
//             //title: '遊戲編號',
//             align:"center",
//             valign:"middle",
//             sortable:"true",
//             editable: {
//                 type: 'text',
//             }
//         }, {
//             field: 'betPosition',
//             //title: '下注點擊位置(x,y)',
//             align:"center",
//             valign:"middle",
//             editable: {
//                 type: 'text',
//             }
//         }, {
//             field: 'changeBetPosition',
//             //title: '押注額切換點擊位置(x,y)',
//             align:"center",
//             valign:"middle",
//             editable: {
//                 type: 'text',
//             }
//         }, {
//             field: 'errorMessagePosition',
//             //title: '錯誤訊息點擊位置',
//             align:"center",
//             valign:"middle",
//             editable: {
//                 type: 'text',
//             }
//         },{
//             field: 'delBtn',
//             //title: '操作',
//             align:"center",
//             valign:"middle",
//             events: operateEvents,
//             formatter: operateFormatter
//         },],
//         /**
//          * @param {點擊列的 field 名稱} field
//          * @param {點擊列的 value 值} value
//          * @param {點擊列的整行數據} row
//          * @param {td 元素} $element
//          */
//         onClickCell: function (field, value, row, $element) {
//             $element.attr('contenteditable', true)
//             $element.blur(function() {
//                 $table.bootstrapTable('updateCell', {
//                     index: $element.parent().data('index'),       //行索引
//                     field: field,       //列名
//                     value: $element.html()        //cell值
//                 })
//             })
//         }
//     })


// })


// function operateFormatter(value, row, index) {
//     return [
//         '<button type="button" class="btn btn-default" id="rowDel"><i class="fas fa-trash-alt"></i></button>'
//     ].join('')
// }
// window.operateEvents = {
//     'click #rowDel': function (e, value, row, index) {
//         $('#dataTable').bootstrapTable('removeByUniqueId', row.id)
//     }
// }