import * as ENG from "./ENG.js";
import * as SCH from "./SCH.js";
import * as TCH from "./TCH.js";
import * as CZE from "./CZE.js";
import * as DAN from "./DAN.js";
import * as GER from "./GER.js";
import * as SPA from "./SPA.js";
import * as FRE from "./FRE.js";
import * as ITA from "./ITA.js";
import * as JPN from "./JPN.js";
import * as KOR from "./KOR.js";
import * as NOR from "./NOR.js";
import * as POL from "./POL.js";
import * as RUS from "./RUS.js";
import * as FIN from "./FIN.js";
import * as SWE from "./SWE.js";
import * as DUT from "./DUT.js";
import * as TUR from "./TUR.js";
import * as THA from "./THA.js";
import * as POR from "./POR.js";
import * as HUN from "./HUN.js";
import * as GRK from "./GRK.js";
import * as ROM from "./ROM.js";

import * as MainActions from '../../actions/MainActions';

export class MultiLanguage {
	constructor(lang) {
		this.langTbl = {};
		switch (lang) {
			case 'ENG':
				this.langTbl = ENG.getLangTbl();
				break;
			case 'TCH':
				this.langTbl = TCH.getLangTbl();
				break;
		}
	}

	getLang(lanKey) {
		if (this.langTbl[lanKey]) {
			return this.langTbl[lanKey];
		} else {
			//return '';
			var engLang = ENG.getLangTbl();
			return engLang[lanKey];
		}
	}

	changeLang(lang) {
		switch (lang) {
			case 'ENG':
			case 'ENC':
				this.langTbl = ENG.getLangTbl();
				break;
			case 'SCH':
				this.langTbl = SCH.getLangTbl();
				break;
			case 'TCH':
				this.langTbl = TCH.getLangTbl();
				break;
			case 'CZE':
				this.langTbl = CZE.getLangTbl();
				break;
			case 'DAN':
				this.langTbl = DAN.getLangTbl();
				break;
			case 'GER':
				this.langTbl = GER.getLangTbl();
				break;
			case 'SPA':
				this.langTbl = SPA.getLangTbl();
				break;
			case 'FRE':
				this.langTbl = FRE.getLangTbl();
				break;
			case 'ITA':
				this.langTbl = ITA.getLangTbl();
				break;
			case 'JPN':
				this.langTbl = JPN.getLangTbl();
				break;
			case 'KOR':
				this.langTbl = KOR.getLangTbl();
				break;
			case 'NOR':
				this.langTbl = NOR.getLangTbl();
				break;
			case 'POL':
				this.langTbl = POL.getLangTbl();
				break;
			case 'RUS':
				this.langTbl = RUS.getLangTbl();
				break;
			case 'FIN':
				this.langTbl = FIN.getLangTbl();
				break;
			case 'SWE':
				this.langTbl = SWE.getLangTbl();
				break;
			case 'DUT':
				this.langTbl = DUT.getLangTbl();
				break;
			case 'TUR':
				this.langTbl = TUR.getLangTbl();
				break;
			case 'THA':
				this.langTbl = THA.getLangTbl();
				break;
			case 'POR':
				this.langTbl = POR.getLangTbl();
				break;
			case 'HUN':
				this.langTbl = HUN.getLangTbl();
				break;
			case 'GRK':
				this.langTbl = GRK.getLangTbl();
				break;
			case 'ROM':
				this.langTbl = ROM.getLangTbl();
				break;
		}

		MainActions.changeLang();
	}

	getBrowserLang() {
		let browLang = navigator.language;
		browLang = browLang.toLowerCase();
		let resLang;
		
		switch (browLang) {
			case 'zh-tw':
			case 'zh-hk': {
				resLang = 'TCH';
				break;
			}
			case 'zh-cn':
			case 'zh-sg': {
				resLang = 'SCH';
				break;
			}
			
			//**********************//
			case 'en':
			case 'en-us':
			case 'en-gb':
			case 'en-au':
			case 'en-ca':
			case 'en-nz':
			case 'en-ie':
			case 'en-za':
			case 'en-jm':
			case 'en-bz':
			case 'en-tt': {
				resLang = 'ENG';
				break;
			}
			//**********************//
			case 'cs': {
				resLang = 'CZE';
				break;
			}
			//**********************//
			case 'da': {
				resLang = 'DAN';
				break;
			}
			//**********************//
			case 'de':
			case 'de-ch':
			case 'de-at':
			case 'de-lu':
			case 'de-li': {
				resLang = 'GER';
				break;
			}
			//**********************//
			case 'es': 
			case 'es-ar':
			case 'es-gt':
			case 'es-cr':
			case 'es-pa':
			case 'es-do':
			case 'es-mx':
			case 'es-ve':
			case 'es-co':
			case 'es-pe':
			case 'es-ec':
			case 'es-cl':
			case 'es-uy':
			case 'es-py':
			case 'es-bo':
			case 'es-sv':
			case 'es-hn':
			case 'es-ni':
			case 'es-pr': {
				resLang = 'SPA';
				break;
			}
			//**********************//
			case 'fr':
			case 'fr-be':
			case 'fr-ca':
			case 'fr-ch':
			case 'fr-lu': {
				resLang = 'FRE';
				break;
			}
			//**********************//
			case 'it':
			case 'it-ch': {
				resLang = 'ITA';
				break;
			}
			//**********************//
			case 'ja': {
				resLang = 'JPN';
				break;
			}
			//**********************//
			case 'ko': {
				resLang = 'KOR';
				break;
			}
			//**********************//
			case 'no': {
				resLang = 'NOR';
				break;
			}
			//**********************//
			case 'pl': {
				resLang = 'POL';
				break;
			}
			//**********************//
			case 'ru':
			case 'ru-mo': {
				resLang = 'RUS';
				break;
			}
			//**********************//
			case 'fi': {
				resLang = 'FIN';
				break;
			}
			//**********************//
			case 'sv':
			case 'sv-fi': {
				resLang = 'SWE';
				break;
			}
			//**********************//
			case 'nl':
			case 'nl-be': {
				resLang = 'DUT';
				break;
			}
			//**********************//
			case 'tr': {
				resLang = 'TUR';
				break;
			}
			//**********************//
			case 'th': {
				resLang = 'THA';
				break;
			}
			//**********************//
			case 'pt-br':
			case 'pt': {
				resLang = 'POR';
				break;
			}
			//**********************//
			case 'hu': {
				resLang = 'HUN';
				break;
			}
			//**********************//
			case 'el': {
				resLang = 'GRK';
				break;
			}
			//**********************//
			case 'ro':
			case 'ro-mo': {
				resLang = 'ROM';
				break;
			}
			default: {
				resLang = 'ENG';
			}
		}
		return resLang;
	}
}

//export default MultiLanguage;
export let lang = new MultiLanguage('ENG');