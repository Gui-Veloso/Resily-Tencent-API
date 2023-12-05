/* global $ TRTC getOS getBrowser */
const DEVICE_TYPE_ENUM = {
  DESKTOP_WIN: 'desktop_win',
  DESKTOP_MAC: 'desktop_mac',
  MOBILE_ANDROID: 'mobile_android',
  MOBILE_IOS: 'mobile_ios'
};

const deviceType = getDeviceType();

/**
 * Obtenha o tipo de dispositivo atual
 */
function getDeviceType() {
  let deviceType;
  const osType = getOS().type;
  const osName = getOS().osName;
  switch (osType) {
    case 'desktop':
      deviceType =
        osName.indexOf('Mac OS') > -1 ? DEVICE_TYPE_ENUM.DESKTOP_MAC : DEVICE_TYPE_ENUM.DESKTOP_WIN;
      break;
    case 'mobile':
      deviceType = osName === 'iOS' ? DEVICE_TYPE_ENUM.MOBILE_IOS : DEVICE_TYPE_ENUM.MOBILE_ANDROID;
      break;
    default:
      break;
  }
  return deviceType;
}

/**
 * Obtenha uma lista de navegadores suportados com base no tipo de dispositivo
 */
function getRecommendBrowserInfo() {
  let recommendBrowserInfo = '';
  switch (deviceType) {
    case DEVICE_TYPE_ENUM.DESKTOP_MAC:
      recommendBrowserInfo =
        ' Para dispositivos Mac OS, use o navegador Chrome, Safari, Firefox 56+ ou Edge 80+ para abrir o link';
      break;
    case DEVICE_TYPE_ENUM.DESKTOP_WIN:
      recommendBrowserInfo = ' Para dispositivos Windows, use o navegador Chrome, Firefox 56+ ou Edge 80+ para abrir o link';
      break;
    case DEVICE_TYPE_ENUM.MOBILE_ANDROID:
      recommendBrowserInfo = ' Para dispositivos Android, use o navegador Chrome para abrir o link';
      break;
    case DEVICE_TYPE_ENUM.MOBILE_IOS:
      recommendBrowserInfo = ' Para dispositivos iOS, use o navegador Safari para abrir o link';
      break;
    default:
      recommendBrowserInfo = 'Recomenda-se baixar a versão mais recente do navegador Chrome（http://www.google.cn/chrome/）link aberto';
      break;
  }
  return recommendBrowserInfo;
}

/**
 * É um navegador Firefox 56+ para desktop?
 */
function isFirefoxM56() {
  if (deviceType === DEVICE_TYPE_ENUM.DESKTOP_WIN || deviceType === DEVICE_TYPE_ENUM.DESKTOP_MAC) {
    let browserInfo = getBrowser();
    if (browserInfo.browser === 'Firefox' && browserInfo.version >= '56') {
      return true;
    }
  }
  return false;
}

/**
 * detecção de suporte rtc
 */
async function rtcDetection() {
  // O navegador atual não suporta webRtc
  let checkResult = await TRTC.checkSystemRequirements();
  let deviceDetectionRemindInfo = '';
  let checkDetail = checkResult.detail;
  console.log('checkResult', checkResult.result, 'checkDetail', checkDetail);
  if (!checkResult.result) {
    // Obtenha informações detalhadas sem suporte via TRTC
    $('#remind-info-container').show();

    // Verifique se o link está em conformidade com as restrições do webRtc
    if (
      location.protocol !== 'https:' &&
      location.hostname !== 'localhost' &&
      location.origin !== 'file://'
    ) {
      deviceDetectionRemindInfo =
        'Verifique o link, o webRTC suporta os três ambientes a seguir:<br>' +
        '1) localhost área<br>' +
        '2) Domínios com HTTPS habilitado<br>' +
        '3) Usar file:/// para arquivo local aberto por protocolo';
      $('#browser-remind').show();
      $('#remind-info').html(deviceDetectionRemindInfo);
      return false;
    }

    // Obtenha informações recomendadas do navegador para o dispositivo atual
    deviceDetectionRemindInfo = getRecommendBrowserInfo();

    console.log('isFirefoxM56', isFirefoxM56());
    if (isFirefoxM56() && !checkDetail.isH264Supported) {
      deviceDetectionRemindInfo =
        'Firefox O suporte à codificação H264 ainda não foi concluído. Aguarde e tente novamente ou use outros navegadores recomendados para abrir o link.<br>' +
        deviceDetectionRemindInfo;
    }

    $('#browser-remind').show();
    $('#remind-info').html(deviceDetectionRemindInfo);

    return false;
  }
  return true;
}
