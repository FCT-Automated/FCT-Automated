var curAPI = document.getElementById('API').value
switch (curAPI) {
    case 'Login':
        document.write( '<div class=\"form-group\">\n' );
        document.write( '<label for=\"LanguageID\">語系:</label>\n' );
        document.write( '<select class=\"form-control\" id=\"LanguageID\">\n' );
        document.write( '<option>簡中:2</option>\n' );
        document.write( '<option>英文:1</option>\n' );
        document.write( '<option>泰文:4</option>\n' );
        document.write( '</select>\n' );
        document.write( '</div>\n' );
        document.write( '<div class=\"form-group\">\n' );
        document.write( '<label for=\"Currency\">幣別:</label>\n' );
        document.write( '<select class=\"form-control\" id=\"Currency\">\n' );
        document.write( '<option>CNY</option>\n' );
        document.write( '</select>\n' );
        document.write( '</div>\n' );
        document.write( '<div class=\"form-group\">\n' );
        document.write( '<label for=\"GameID\">遊戲名稱:</label>\n' );
        document.write( '<select class=\"form-control\" id=\"GameID\">\n' );
        document.write( '<option>三隻小豬:22017</option>\n' );
        document.write( '</select>\n' );
        document.write( '</div>\n' );
        document.write( '<div class=\"form-group\">\n' );
        document.write( '<label for=\"AgentCode\">商戶代碼:</label>\n' );
        document.write( '<select class=\"form-control\" id=\"AgentCode\">\n' );
        document.write( '<option>FCT</option>\n' );
        document.write( '</select>\n' );
        document.write( '</div>\n' );
        document.write( '<div class=\"form-group\">\n' );
        document.write( '<label for=\"MemberAccount\">帳號:</label>\n' );
        document.write( '<input class=\"form-control\" id=\"MemberAccount\">\n' );
        document.write( '</div>' );
        break;
    case 'SetPoints':
        document.write( '<label for=\"MemberAccount\">123:</label>\n' );
        break;
    case 'KickOut':
        document.write( '<label for=\"MemberAccount\">4596:</label>\n' );
        break;
      
  }