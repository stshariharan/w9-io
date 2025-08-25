export const mailTemplates = {
    ExceptionTemplate : `
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>

    <div style="background:#3097f3; padding:15px 10px; border-radius:10px 10px 0px 0px; text-align:center; color:#fff; font:bold italic 1.5em Arial, Helvetica, sans-serif;">
        Exception
    </div>
     <div class="logo" style="text-align:center; margin:20px 0;">
            <img src="https://v1-sandbox.taxbandits.com/Content/Images/logo.png" alt="Logo" />
          </div>
    <div style="max-width:1300px;margin:0 auto; padding:20px 10px 0;">
        <table style="width:100%;font-family:system-ui;font-weight:400;font-size:15px;color:#000">
            <tbody>
                <tr>
                    <td>
                        <div style="padding:15px 15px;font:normal 14px system-ui;line-height:22px">
                            <table width="100%" cellspacing="0" cellpadding="0" border="1" style="border-collapse: collapse;border: 1px solid #cccc;">
                                <tbody>
                                    <tr>
                                        <td style="padding:6px 8px;">
                                            <div style="font-size: 14px;font-weight: 700;margin-bottom: 0px;">Exception Message</div>
                                            <div style="word-break: break-all;font-size: 14px;">@@ErrorMessage</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 8px;">
                                            <div style="font-size: 14px;font-weight: 700;margin-bottom: 0px;">Stack Trace</div>
                                            <div style="word-break: break-all;font-size: 14px;">@@StackTrace</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 8px;">
                                            <div style="font-size: 14px;font-weight: 700;margin-bottom: 0px;">Source Path</div>
                                            <div style="word-break: break-all;font-size: 14px;">@@SourcePath</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 8px;">
                                            <div style="font-size: 14px;font-weight: 700;margin-bottom: 0px;">Url Path</div>
                                            <div style="word-break: break-all;font-size: 14px;">@@UrlPath</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 8px;">
                                            <div style="font-size: 14px;font-weight: 700;margin-bottom: 0px;">Method Type</div>
                                            <div style="word-break: break-all;font-size: 14px;">@@MethodType</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 8px;">
                                            <div style="font-size: 14px;font-weight: 700;margin-bottom: 0px;">Query String</div>
                                            <div style="word-break: break-all;font-size: 14px;">@@QueryString</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 8px;">
                                            <div style="font-size: 14px;font-weight: 700;margin-bottom: 0px;">IP Address</div>
                                            <div style="word-break: break-all;font-size: 14px;">@@IPAddress</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 8px;">
                                            <div style="font-size: 14px;font-weight: 700;margin-bottom: 0px;">Email Address</div>
                                            <div style="word-break: break-all;font-size: 14px;">@@EmailAddress</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 8px;">
                                            <div style="font-size: 14px;font-weight: 700;margin-bottom: 0px;">User ID</div>
                                            <div style="word-break: break-all;font-size: 14px;">@@UserId</div>
                                        </td>
                                    </tr>
                                     <tr>
                                        <td style="padding:6px 8px;">
                                            <div style="font-size: 14px;font-weight: 700;margin-bottom: 0px;">User Token</div>
                                            <div style="word-break: break-all;font-size: 14px;">@@UserToken</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 8px;">
                                            <div style="font-size: 14px;font-weight: 700;margin-bottom: 0px;">Partner User ID</div>
                                            <div style="word-break: break-all;font-size: 14px;">@@PartnerUserId</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 8px;">
                                            <div style="font-size: 14px;font-weight: 700;margin-bottom: 0px;">Address Book Token</div>
                                            <div style="word-break: break-all;font-size: 14px;">@@AddressBookToken</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 8px;">
                                            <div style="font-size: 14px;font-weight: 700;margin-bottom: 0px;">Access Token</div>
                                            <div style="word-break: break-all;font-size: 14px;">@@APIToken</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:6px 8px;">
                                            <div style="font-size: 14px;font-weight: 700;margin-bottom: 0px;">Exception Time (EST)</div>
                                            <div style="word-break: break-all;font-size: 14px;">@@ExceptionTime</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>
`
}