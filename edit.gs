/***********************************************************************************
不正な入力に対する警告を表示（表示するだけ。入力値が不正のままである場合はvalidCheck()やsetReminder内部のthrowによって対処
***********************************************************************************/
function onEdit(e) {
 
  try {
//    const sh = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const range = e.range;
    const cell = range.getValue();
    
    if (range.getRow() === 2 && range.getColumn() > 2 && !!cell) { //!!cellは cell !== ""のこと。セルを空白にした際にメッセが表示される事を回避するため、必要
      if (String(cell).length < 3 ) { 
        Browser.msgBox("文字数が短すぎるようです。\\n3文字以上の入力をお願いいたします。");
        range.clearContent();
      } ;
    }
    
    if (range.getRow() === 4 && range.getColumn() > 2 && !!cell && ((cell > 40320 || 5 > cell ) || (typeof cell !== "number"))) {
      Browser.msgBox("入力された数字（分）が適切ではないか、数字以外が入力されています。\\n5~40320の数字を参照してください");
      range.clearContent();
    };
    
    if (range.getRow() === 4 && range.getColumn() > 2 && !!cell && parseInt(cell) % 5 !== 0) {
      Browser.msgBox("入力された数字（分）は5の倍数ではありません。\\n5の倍数を入力してください。");
      range.clearContent();
    };
    
    if (range.getRow() === 2 && range.getColumn() === 2 && typeof cell != "boolean" ) {
      Browser.msgBox("B2セルは、チェックボックスである必要があります。");
      range.insertCheckboxes();
    };
    
    if (range.getRow() === 4 && range.getColumn() === 2 && Object.prototype.toString.call(cell) !== '[object Date]') {
      Logger.log("a");
      Browser.msgBox("B4セルには時間が入力されている必要があります。\\n入力例: 8:00");
      range.clearContent();
    };
      
  } catch(e) {
    Logger.log(e);
    Browser.msgBox(e);
  }
};


/***********************************************************************************
main.gsのsetReminder()を起動時に実行。スプシの一部（下記）に不正な値が入力がされていたら、setReminderのtryを終了し、エラーを通知するメールを自分に送信する
・2,4行目
・C~E列
※他のセルの値のエラーはsetReminder内部で都度throwしている
***********************************************************************************/
function validCheck() {
    let erMsg = "";

    const sh = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const strs = sh.getRange('C2:E2').getValues();
    const mins = sh.getRange('C4:E4').getValues();
    const cols = ["C", "D", "E"]; //エラーメールにセル位置を書きたい
    const baseMsg = "エラー：  "
//    const datas = strs[0].concat(mins[0]);
//    Logger.log(datas);

// 2行目と4行目でエラーチェック
    const rows = [
      {
        rowNum: 2,
        rowRange: strs[0]
      },

      {
        rowNum: 4,
        rowRange: mins[0]
      }
    ];

    for (const row of rows) {
        let cnt = 0;

        for (const col of row.rowRange) {
            const cellName = cols[cnt] + row.rowNum + "セル";

            if (row.rowNum === 2) {
                if ( !(typeof col === "string" || typeof col === "number") ) {
                  erMsg  += baseMsg + cellName + "および2行目には文字列または数字を入力してください。\n";
                } else if  ((typeof col === "string" || typeof col === "number") && String(col).length < 3 && String(col) !== "") {
                  erMsg  += baseMsg + cellName + "に入力された文字数が短すぎます。" + row.rowNum + "行目は3文字以上で入力してください。\n";
                };

            } else if (row.rowNum === 4) {
                if (col !== "" && typeof col !== "number") {
                  erMsg += baseMsg + cellName +  "には数字を入力してください。\n";
                } else if (col !== "" && typeof col === "number" && (col > 40320 || 5 > col) ) {
                  erMsg += baseMsg + "指定された通知時間「" + col + "」は無効です。" + cellName + "および" + row.rowNum + "行目の数値は5～40320(分)の間で、5の倍数を指定してください。\n";
                };
                
                if (col % 5 !== 0) erMsg += baseMsg + "指定された通知時間「" + col + "」は無効です。" + cellName + "および" + row.rowNum + "行目の数値は、5の倍数を指定してください。\n";
            };
            cnt += 1;
        };

    };
    Logger.log("validCheck: " + erMsg);
    return erMsg;
}