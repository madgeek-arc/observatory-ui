## [4.0.0](https://github.com/madgeek-arc/observatory-ui/compare/3.2.0...4.0.0) (2025-12-23)

### ⚠ BREAKING CHANGES

* incopatible url parameters

*  fix!: change orderField url param to sort ([1bd93e0](https://github.com/madgeek-arc/observatory-ui/commit/1bd93e0a4640ea128ba07967579dbbdb66dfb6a8))

### Features

* Add a post-clean validation step for submitted resources. ([4aaf80c](https://github.com/madgeek-arc/observatory-ui/commit/4aaf80cb74898d748b199c0792f287309ad54c46))
* Add Approve/Reject functionality with alert messages ([9d2c927](https://github.com/madgeek-arc/observatory-ui/commit/9d2c92799abede8384dacab9b8f7deac18b1bfab))
* add divs displaying data for Repositories, Open Science Training, Data Management and FAIR Data ([5a1e5e9](https://github.com/madgeek-arc/observatory-ui/commit/5a1e5e986eff919ea3381689064aad2eefc1cc80))
* add funcionality to side cards and implement read more feature ([5712d89](https://github.com/madgeek-arc/observatory-ui/commit/5712d890761182ae8050ff9741ec71c88e0f4236))
* Add functionality to Citizen Science component including 'read more' feature ([af530f1](https://github.com/madgeek-arc/observatory-ui/commit/af530f121e7f7db391da7bd30a2b1124dda0bdb7))
* add new pages (Repositories, Open Science Training, Open Softwares) and update navigation menu structure ([5995eba](https://github.com/madgeek-arc/observatory-ui/commit/5995eba36e57190f9c63450d6f61cbf7bcb9cd36))
* add SidebarMobileToggleComponent and prepare sidebar components for mobile ([703ec05](https://github.com/madgeek-arc/observatory-ui/commit/703ec0510253d88369034c98f89ca84aede301b1))
* added mobile-only visibility to sidebar-mobile-toggle component ([cff0136](https://github.com/madgeek-arc/observatory-ui/commit/cff0136e2f0c27c39d1b1f84254aca353fb38144))
* Begin implementation of dynamic form model ([724fea8](https://github.com/madgeek-arc/observatory-ui/commit/724fea8175f37dd7a97b2b5b56ffc6665707b094))
* charts in fair data and data management ([c4dfbbd](https://github.com/madgeek-arc/observatory-ui/commit/c4dfbbdf83ee81984efee8d83ab956f40627ff13))
* **citizen-science:** Enable dynamic year selection; stabilizes 0/0 diff calculation in General-R&D-overview component. ([3a16105](https://github.com/madgeek-arc/observatory-ui/commit/3a16105fa10bb3567e7bfc9b6ed2baddef5ada3c))
* color changes for maps and column charts ([07276db](https://github.com/madgeek-arc/observatory-ui/commit/07276db54e7b8772496e55796c65124064dfff6f))
* Complete dynamic form with submission and fix URL links property ([bd5fd49](https://github.com/madgeek-arc/observatory-ui/commit/bd5fd49a2e48474fc212c01a67334b7d9867a3ed))
* complete report section 5 (Services) ([9e6c6b9](https://github.com/madgeek-arc/observatory-ui/commit/9e6c6b994283e91d8f45e71413facd99d2f7c3ee))
* complete report section 6 (Infrastructure) and section 7 (Skills/Training) ([f3b46a1](https://github.com/madgeek-arc/observatory-ui/commit/f3b46a13172869fb711afcbd6fe0208635cf752a))
* complete report section 8 (Assessment) ([1f60d2a](https://github.com/madgeek-arc/observatory-ui/commit/1f60d2acbea2067e7b97df54b74be591992fce96))
* complete report sections 3 (Data) and 4 (Software) ([c5f8772](https://github.com/madgeek-arc/observatory-ui/commit/c5f8772bb489d017f1f8cfbc55168b87047dbadb))
* **components:** pass dynamic year to Open Science Training, Repositories, and Open Software ([e388e0f](https://github.com/madgeek-arc/observatory-ui/commit/e388e0f29d29508e7f64d0a0e1e085b3b9965a9c))
* Corrected the funding info in the footer for the mobile view ([6adc0a4](https://github.com/madgeek-arc/observatory-ui/commit/6adc0a45455567c684f4fc1ef1014656f07be6fc))
* **country-page:** add export report functionality to all components ([ecdedd9](https://github.com/madgeek-arc/observatory-ui/commit/ecdedd9b27a8a8bb5f63004d1f86843bd9ce1625))
* **country-pages.queries:** Ensure all queries dynamically use current and previous year values ([e3979a8](https://github.com/madgeek-arc/observatory-ui/commit/e3979a8a07bd30342d70c769a6c44b1a7d8f2e5e))
* **country-pages:** add page layout structure and sidebar toggle to all components ([095ee59](https://github.com/madgeek-arc/observatory-ui/commit/095ee59b24f596547f352567fd9b0768cc3d0e0d))
* create report for section 9 (Engagement) and section 10 (Total Investments in EOSC and Open Science) ([2e4d44a](https://github.com/madgeek-arc/observatory-ui/commit/2e4d44ace7803e1bfce6c65ccdedad6e07d82267))
* **data-management:** pass dynamic year to component and charts ([5257df8](https://github.com/madgeek-arc/observatory-ui/commit/5257df841d81a2c046dc5bf395744da14d7a790b))
* display data using Highcharts map in report-creation.component.ts ([6fc347f](https://github.com/madgeek-arc/observatory-ui/commit/6fc347fde0cba8969494cf68d8e0bcad38a5d3d1))
* display survey data at OA Publication,Policies, General sections ([a6a0ed0](https://github.com/madgeek-arc/observatory-ui/commit/a6a0ed01c706f874a13bc4d51c5b969387e9e81c))
* **document-edit:** Implement document update functionality and form submission ([f900549](https://github.com/madgeek-arc/observatory-ui/commit/f900549547b9b8c6c821ee81c78fe3d32f93d618))
* **document-edit:** implement FormArray population logic for all arrays ([925be29](https://github.com/madgeek-arc/observatory-ui/commit/925be29a07cd2e24805e5eb0c1f7463e107db8b2))
* **document-edit:** Implement full FormArray ts logic and build html structure ([1d7b732](https://github.com/madgeek-arc/observatory-ui/commit/1d7b732151a00718644a125a1e619bfae05841fa))
* **document-edit:** Implement Reactive Form structure and helpers ([710647e](https://github.com/madgeek-arc/observatory-ui/commit/710647eea6f312bd859aec1337fecd545d256368))
* **document-editor:** Implement Authors FormArray and refactor to FormGroup ([9fc7eb9](https://github.com/madgeek-arc/observatory-ui/commit/9fc7eb9e895556cd952eb48c985fb2c9cc246a99))
* **document-landing.component.html:** Enable Edit button link  on Document Landing page ([16cba5b](https://github.com/madgeek-arc/observatory-ui/commit/16cba5b1b4ff046a0f6e4a7acb553b196e7e7947))
* explore side bar first implementation ([c055af3](https://github.com/madgeek-arc/observatory-ui/commit/c055af3b86c8c8126694c6fdf721859af887248a))
* **fair-data:** make stackedColumnCategories dynamic based on selected year ([c7fc60c](https://github.com/madgeek-arc/observatory-ui/commit/c7fc60ced6b231a720dc92b6e68dd349245bb73b))
* **fair-data:** make year dynamic and changed modelsIds to 2023 and 2024 ([df1a458](https://github.com/madgeek-arc/observatory-ui/commit/df1a45848927ed3472a686780a124e3f133b9582))
* guard for country pages routes ([82bb6e4](https://github.com/madgeek-arc/observatory-ui/commit/82bb6e491ad35b4215b21864cff2502ac5853923))
* **highlight:** add replaceWithHighLighted method to handle array-based highlight fields and getHighlightedField method to enable title, organisations highlight support ([04c6d0d](https://github.com/madgeek-arc/observatory-ui/commit/04c6d0d60c271f657ef7b8d5ea6a11dcbfaaa077))
* **info-card:** add reusable InfoCard component with titleHtml support ([c2bdb66](https://github.com/madgeek-arc/observatory-ui/commit/c2bdb6690a6151afc8fa4f0b28526c203acfee2c))
* New administrator pages. ([4d03e04](https://github.com/madgeek-arc/observatory-ui/commit/4d03e041b2d884728e95ce6806521074208d68fd))
* new chart type at open science by Area -> publications ([3e29904](https://github.com/madgeek-arc/observatory-ui/commit/3e299048ca4653f1727775878c679f38b65ef32f))
* **open-access-publications:** Updated component to use combineLatest on countryCode and  year for automatic updates ([8fbee31](https://github.com/madgeek-arc/observatory-ui/commit/8fbee316e21fcf98ed9085c8b170a0726ea566c1))
* **open-data:** use combineLatest for reactive countryCode and year and ensures charts update aytomatically when either the country or year changes. Added dynamic year parameter to trendOfOpenDataCountry and trendOfOAPublicationsCountry functions. ([516dca7](https://github.com/madgeek-arc/observatory-ui/commit/516dca7a58432ae0b54f375f2019b36b6c3f3c5f))
* pass year dynamically via observable in R&D and Policy Overview charts ([263971f](https://github.com/madgeek-arc/observatory-ui/commit/263971fe5b6170b6c9cf7568ba174eb727f84c12))
* **report-creation:** Implement totalInvestmentsRangeColumnSeries chart logic ([e05ee28](https://github.com/madgeek-arc/observatory-ui/commit/e05ee28db754cdab6296338c08d04e7025cf8de5))
* Resources registry admin pages ([9e7e97e](https://github.com/madgeek-arc/observatory-ui/commit/9e7e97e25ed22ae894d5ab4376dd8fcfb618568c))
* Search and landing pages for resource registry ([59b5dac](https://github.com/madgeek-arc/observatory-ui/commit/59b5dac52fa082861dc02d1178b1d1ac7838770e))
* **search.component:** add smooth scroll to alert message after status update ([3fa7f2d](https://github.com/madgeek-arc/observatory-ui/commit/3fa7f2dc09f1dc8c8276cd2d0fe683fc91f5bf81))
* set colors for noads and external sources ([aabee2a](https://github.com/madgeek-arc/observatory-ui/commit/aabee2a41de7ebc566c64bb0ad1595d1d8f5deb9))
* show sankey demo chart to OS by area at publications section ([79037bc](https://github.com/madgeek-arc/observatory-ui/commit/79037bcef2c1278d908470f55b26855e42eb4a59))
* side menu entries and card component for country pages dashboard ([d7c6503](https://github.com/madgeek-arc/observatory-ui/commit/d7c650314a3c2c4a8c49ce94c673c65bfab83f0d))
* support for xAxis duplication at bar chart ([77797d7](https://github.com/madgeek-arc/observatory-ui/commit/77797d721510e9f7570d299348b838f00e5e9168))
* svg icons for explore side bar ([60642b7](https://github.com/madgeek-arc/observatory-ui/commit/60642b7d83a0ba6d8a1449e8dbbe20efbbd434a2))
* theme update wip ([abd925b](https://github.com/madgeek-arc/observatory-ui/commit/abd925b6d2b093fd3b9769ebb02d2c55febf931a))
* **ui:** make all components responsive across different screen sizes ([b2bcdec](https://github.com/madgeek-arc/observatory-ui/commit/b2bcdecc0aaa38f8324bdc26cd382927e55929ba))
* **ui:** show grey 'commit' icon and grey percentage for 0% in InfoCard ([1fc739e](https://github.com/madgeek-arc/observatory-ui/commit/1fc739e5b0821bac318c9d5094958446e51065f2))
* Update Eosc readiness dashboard with the new side menu component. ([4d788b2](https://github.com/madgeek-arc/observatory-ui/commit/4d788b2beb08d62c5487c376115d21b464889d16))

### Bug Fixes

* add 'files' to location ([bb6bbb4](https://github.com/madgeek-arc/observatory-ui/commit/bb6bbb467543521c0fcf7a9b2e7017166e239183))
* correct mistakes in section 5 (Services) ([1990a0e](https://github.com/madgeek-arc/observatory-ui/commit/1990a0ec115571171e973dcac51f5b538695b246))
* Corrected typo increasesince to increase since throughout document ([2c0ad66](https://github.com/madgeek-arc/observatory-ui/commit/2c0ad663c4b0d6ba69fc7d76ee021f41a2d94e91))
* display correct colors at cards, hide empty cards answers ([85adc0d](https://github.com/madgeek-arc/observatory-ui/commit/85adc0d96fd6c2d89c24b50dd140bd34f5a44354))
* document creation fixes (wording, data mismatch). ([c7cd388](https://github.com/madgeek-arc/observatory-ui/commit/c7cd38859b4b22b482847ec3fc8275be0d4bbaae))
* **fair-data, data-management:** Corrected year comparison range in FAIR Data and Data Management component. ([e4bb1bf](https://github.com/madgeek-arc/observatory-ui/commit/e4bb1bf85f91b8dec264014a7e81cf5c060414b8))
* Ignore string null values ('null') when calculating percetages. ([3eba896](https://github.com/madgeek-arc/observatory-ui/commit/3eba896a9d5229eb48d40b6987d861bb71fc99d5))
* **info-card:** show grey icon and percentage when diff is 0% ([dd78056](https://github.com/madgeek-arc/observatory-ui/commit/dd78056a2240664cab63bfb66eacab4bd25624c7))
* inject DashboardSideMenuService to app.component in order to initialize it early ([07a32bb](https://github.com/madgeek-arc/observatory-ui/commit/07a32bb3e4249745ad7da08b6cf598a394dbea15))
* **matomo:** corrects typo on url ([2899280](https://github.com/madgeek-arc/observatory-ui/commit/289928029513406efe3b5fb09d1137c6a4dc633d))
* **matomo:** replace deprecated matomo configuration ([5d2e7be](https://github.com/madgeek-arc/observatory-ui/commit/5d2e7beb031d5a179a67fdc7acabd4faf4efae2a))
* move info box slightly to the left for categorized map charts, map title changes ([53cff65](https://github.com/madgeek-arc/observatory-ui/commit/53cff656adda901c10e368ad915115c67ac6e2bb))
* open science by area sub navigation list properly displays when navigating to an area section explore side menu ([3b9aa5f](https://github.com/madgeek-arc/observatory-ui/commit/3b9aa5f77ed679303aba231ba7f425bad836a120))
* remove edit & approve buttons from the resources registry search page and a fix in the title of the landing page of the resource ([fd4e1f2](https://github.com/madgeek-arc/observatory-ui/commit/fd4e1f2572193936b7857993a4fdccb160b0683b))
* **report-chart:** correct zero-response handling to prevent undefined outputs ([1c571c4](https://github.com/madgeek-arc/observatory-ui/commit/1c571c49f6d7e318c3f4ed439d3ec419f193fc30))
* Show correct years for chart captions at explore dashboard. ([739f582](https://github.com/madgeek-arc/observatory-ui/commit/739f582567626ad0e181c5e78552d3edcf9a57e1))
* title for section 4.3.2 ([8ecdd1e](https://github.com/madgeek-arc/observatory-ui/commit/8ecdd1ea7364e133546a315a31cd6d64f73212b1))
* uikit import ([a3a4cbe](https://github.com/madgeek-arc/observatory-ui/commit/a3a4cbee937e70216413e6925e4d5cefee99ecf9))
* Various bug fixes for country pages ([19bb7f1](https://github.com/madgeek-arc/observatory-ui/commit/19bb7f15bdb27dde2c028f72b571e04df199b94a))
* Various changes from recommendations ([e5dc474](https://github.com/madgeek-arc/observatory-ui/commit/e5dc4742d53e0dc6f9f8dfef6a5240fc92ba6b8e))

## [3.2.0](https://github.com/madgeek-arc/observatory-ui/compare/3.1.0...3.2.0) (2025-07-03)

### Bug Fixes

* display correct colors at cards, hide empty cards answers ([85adc0d](https://github.com/madgeek-arc/observatory-ui/commit/85adc0d96fd6c2d89c24b50dd140bd34f5a44354))
* inject DashboardSideMenuService to app.component in order to initialize it early ([07a32bb](https://github.com/madgeek-arc/observatory-ui/commit/07a32bb3e4249745ad7da08b6cf598a394dbea15))


### Features

* add divs displaying data for Repositories, Open Science Training, Data Management and FAIR Data ([5a1e5e9](https://github.com/madgeek-arc/observatory-ui/commit/5a1e5e986eff919ea3381689064aad2eefc1cc80))
* add funcionality to side cards and implement read more feature ([5712d89](https://github.com/madgeek-arc/observatory-ui/commit/5712d890761182ae8050ff9741ec71c88e0f4236))
* Add functionality to Citizen Science component including 'read more' feature ([af530f1](https://github.com/madgeek-arc/observatory-ui/commit/af530f121e7f7db391da7bd30a2b1124dda0bdb7))
* add new pages (Repositories, Open Science Training, Open Softwares) and update navigation menu structure ([5995eba](https://github.com/madgeek-arc/observatory-ui/commit/5995eba36e57190f9c63450d6f61cbf7bcb9cd36))
* add SidebarMobileToggleComponent and prepare sidebar components for mobile ([703ec05](https://github.com/madgeek-arc/observatory-ui/commit/703ec0510253d88369034c98f89ca84aede301b1))
* added mobile-only visibility to sidebar-mobile-toggle component ([cff0136](https://github.com/madgeek-arc/observatory-ui/commit/cff0136e2f0c27c39d1b1f84254aca353fb38144))
* charts in fair data and data management ([c4dfbbd](https://github.com/madgeek-arc/observatory-ui/commit/c4dfbbdf83ee81984efee8d83ab956f40627ff13))
* Corrected the funding info in the footer for the mobile view ([6adc0a4](https://github.com/madgeek-arc/observatory-ui/commit/6adc0a45455567c684f4fc1ef1014656f07be6fc))
* **country-pages:** add page layout structure and sidebar toggle to all components ([095ee59](https://github.com/madgeek-arc/observatory-ui/commit/095ee59b24f596547f352567fd9b0768cc3d0e0d))
* display survey data at OA Publication,Policies, General sections ([a6a0ed0](https://github.com/madgeek-arc/observatory-ui/commit/a6a0ed01c706f874a13bc4d51c5b969387e9e81c))
* explore side bar first implementation ([c055af3](https://github.com/madgeek-arc/observatory-ui/commit/c055af3b86c8c8126694c6fdf721859af887248a))
* guard for country pages routes ([82bb6e4](https://github.com/madgeek-arc/observatory-ui/commit/82bb6e491ad35b4215b21864cff2502ac5853923))
* svg icons for explore side bar ([60642b7](https://github.com/madgeek-arc/observatory-ui/commit/60642b7d83a0ba6d8a1449e8dbbe20efbbd434a2))
* theme update wip ([abd925b](https://github.com/madgeek-arc/observatory-ui/commit/abd925b6d2b093fd3b9769ebb02d2c55febf931a))

## [3.0.0](https://github.com/madgeek-arc/observatory-ui/compare/2.8.4...3.0.0) (2025-02-14)

### ⚠ BREAKING CHANGES

* incopatible url parameters

*  fix!: change orderField url param to sort ([8b9e086](https://github.com/madgeek-arc/observatory-ui/commit/8b9e086e3a37d4d8b26675b0e4e9164e85faf48f))

