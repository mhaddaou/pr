import { Injectable, Logger } from '@nestjs/common';
import { link, promises } from 'fs';
import { Browser, BrowserContext, chromium, firefox, Page } from 'playwright';
import { exit } from 'process';
import { GetInvDto, StatusType } from './dtos/get-inv.dto';
import * as fs from 'fs';
import axios from 'axios';
import { InvitationGroup } from './dtos/invitation-group.dto';
interface BrowserPlugin {
  name: string;
  description: string;
  filename: string;
  item?: (index: number) => BrowserPlugin;
  namedItem?: (name: string) => BrowserPlugin | undefined;
}

@Injectable()
export class TiktokService {
  private readonly userAgents = [
    // Chrome on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.118 Safari/537.36',

    // Chrome on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.118 Safari/537.36',

    // Chrome on Linux
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',

    // Edge on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.2535.67',

    // Firefox on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',

    // Firefox on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:126.0) Gecko/20100101 Firefox/126.0',

    // Safari on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',

    // Chrome on Android
    'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.165 Mobile Safari/537.36',

    // Chrome on iOS
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0.6422.80 Mobile/15E148 Safari/604.1',
  ];
  // 9635

  private async initBrowser(cookies: string) {
    const browser = await firefox.launch({
      headless: true,
      args: [
        // Firefox-specific arguments
        '--disable-extensions',
        '--no-sandbox',
      ],
      // Firefox-specific launch options
      firefoxUserPrefs: {
        'dom.webdriver.enabled': false,
        'general.useragent.override':
          this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
      },
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      //   viewport: null,
      userAgent:
        this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
      permissions: ['geolocation'],
      geolocation: { latitude: 51.5074, longitude: -0.1278 },
      locale: 'en-US',
    });

    const page = await context.newPage();

    // Firefox-specific method to bypass webdriver detection
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          const plugins: BrowserPlugin[] = [
            {
              name: 'Chrome PDF Plugin',
              description: 'Portable Document Format',
              filename: 'internal-pdf-viewer',
            },
            {
              name: 'Chrome PDF Viewer',
              description: 'PDF Viewer',
              filename: 'mhjfbmdgcfjbbpaeojofohoednbiigko',
            },
            {
              name: 'Native Client',
              description: 'Native Client Executable',
              filename: 'internal-nacl-plugin',
            },
            {
              name: 'WebKit built-in PDF',
              description: 'PDF Viewer',
              filename: 'pdf-viewer',
            },
          ];

          // Add methods to the plugins array
          (plugins as any).item = (index: number) => plugins[index];
          (plugins as any).namedItem = (name: string) =>
            plugins.find((plugin) => plugin.name === name);

          return plugins;
        },
      });

      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });

    await page.goto('https://seller-us-accounts.tiktok.com/account/login');
    await page.waitForLoadState('load');
    const cookie = this.parseCookiesForPlaywright(cookies);
    await context.addCookies(cookie);
    await page.reload();
    await page.goto(
      'https://affiliate-us.tiktok.com/connection/creator?shop_region=US',
    );

    return { browser, context, page };
  }

  async handlIvitation(body: any, page: Page, index: number) {
    try {
      // body.filter && (await this.filter(body.filter, page));

      // don't forget to handl this error if not found;
      for (;;) {
        const count = await page
          .locator(
            'tr > td > div > span > div > div > span > span  span.text-body-m-medium',
          )
          .count();
        if (count > 0) {
          console.log('is visible this element');
          break;
        } else {
          console.log('is not visible the element');
          await page.reload();
        }
      }
      await page.waitForSelector(
        'tr > td > div > span > div > div > span > span  span.text-body-m-medium',
      );
      await page
        .locator('tr:nth-child(19) > td:nth-child(7)')
        .scrollIntoViewIfNeeded();
      for (;;) {
        const count = await page
          .locator(
            'tr > td > div > span > div > div > span > span  span.text-body-m-medium',
          )
          .count();
        console.log(count, 'thi s count');
        if (count > 12) break;
      }
      const names = await page
        .locator(
          'tr > td > div > span > div > div > span > span  span.text-body-m-medium',
        )
        .allInnerTexts();
      const btn = page.locator(`tr:nth-of-type(1) span > div > span button`);
      btn.scrollIntoViewIfNeeded();
      await btn.click();
      await page.getByRole('button', { name: '+ Create invitation' }).click();
      const res = await this.createInvitation(body, page, index, names);
      if (!res.isSuccess) {
        return res;
      }
      return await this.handlWithAlreadyInvitation(body, page);
    } catch (e) {
      Logger.error('handlIvitation says: ', e.message);
    }
  }

  async handlWithAlreadyInvitation(body: any, page: Page) {
    try {
      const invitationName = body['invitation']['createInvitation']
        ? body['invitation']['invitationDetails']['name']
        : body['invitation']['invitationName'];
      const numberInvites = body['invitation']['numberInvites'];

      body.filter && (await this.filter(body.filter, page));
      const inv = body['invitation']['createInvitation'] ? 1 : 0;
      return await this.sendingInvitation(
        invitationName,
        numberInvites,
        page,
        inv,
      );
    } catch (e) {
      Logger.error('handlWithAlreadyInvitation says: ', e);
    }
  }

  parseCookiesForPlaywright(
    cookieString: string,
    domain: string = '.tiktok.com',
  ): Parameters<BrowserContext['addCookies']>[0] {
    // Split the cookie string into individual cookies
    const cookiePairs = cookieString.split(';');

    // Parse cookies into Playwright format
    const parsedCookies = cookiePairs
      .map((pair) => {
        const trimmedPair = pair.trim();
        const [name, value] = trimmedPair.split('=');

        if (!name || !value) return null;

        return {
          name: name.trim(),
          value: value.trim(),
          domain,
          path: '/',
          // Optional: add more fields if needed
          // httpOnly: true,
          // secure: true,
        };
      })
      .filter(
        (cookie): cookie is Exclude<typeof cookie, null> => cookie !== null,
      );

    return parsedCookies;
  }
  isValidFutureDate(dateString: string): boolean {
    const inputDate = new Date(dateString);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return inputDate > today;
  }

  async automation(body: any) {
    let browser: Browser = null;
    let context: BrowserContext = null;
    let page: Page = null;
    try {
      if (body['invitation']['createInvitation']) {
        if (!body['invitation']['invitationDetails']) {
          return {
            isSuccess: false,
            message:
              'Create invitation failed : please provide invitation details',
          };
        }

        const invitationDetails: {
          name: string;
          date: string;
          message: string;
          productIds: Array<string>;
          autoApprove: boolean;
          rates: Array<string>;
        } = body['invitation']['invitationDetails'];

        const isEmptyOrNotFound =
          !invitationDetails || Object.keys(invitationDetails).length === 0;
        if (isEmptyOrNotFound) {
          return {
            isSuccess: false,
            message:
              'Create invitation failed : please provide invitation details',
          };
        }
        if (!invitationDetails.name || invitationDetails.name === '') {
          return {
            isSuccess: false,
            message:
              'Create invitation failed : please provide a name of invitation',
          };
        }
        if (!invitationDetails.message || invitationDetails.message === '') {
          return {
            isSuccess: false,
            message:
              'Create invitation failed : please provide a message of invitation',
          };
        }
        console.log(typeof invitationDetails.autoApprove);
        if (typeof invitationDetails.autoApprove !== 'boolean') {
          return {
            isSuccess: false,
            message:
              'Create invitation failed : please provide a autoApprove field in invitation and must be a boolean',
          };
        }
        if (
          invitationDetails.productIds.length != invitationDetails.rates.length
        ) {
          return {
            isSuccess: false,
            message:
              'Create invitation failed : the rates length must be like products length',
          };
        }
        if (!this.isValidFutureDate(invitationDetails.date)) {
          return {
            isSuccess: false,
            message:
              'Create invitation failed : the selected date is not valid. Please choose a date after today.',
          };
        }
      }

      const cookies = body['cookies'];
      ({ browser, context, page } = await this.initBrowser(cookies));
      await page.waitForLoadState('load');
      let isLogin: boolean = false;
      for (;;) {
        const isLoginSucceess = await page
          .getByRole('button', { name: 'Close' })
          .isVisible({ timeout: 2000 });
        if (isLoginSucceess) {
          await page.getByRole('button', { name: 'Close' }).click();
          isLogin = true;
          break;
        }
        const isNotLogin1 = await page
          .locator('div')
          .filter({ hasText: /^Log in$/ })
          .isVisible({ timeout: 2000 });
        const isNotLogin2 = await page
          .getByRole('button', { name: 'Log in', exact: true })
          .isVisible({ timeout: 2000 });
        if (isNotLogin1 || isNotLogin2) {
          console.log('cookie is expired');
          break;
        }
      }

      if (!isLogin) {
        return { isSuccess: false, message: 'Invalid or expired cookies' };
      }

      console.log('after login');
      const captchaVisible = await page.isVisible('#captcha_container');
      if (captchaVisible) {
        await page.screenshot({ path: 'catptcha.png' });
        return {
          isSuccess: false,
          message: 'captcha is visible please try again',
        };
      }
      const isVisible = await page
        .getByRole('button', { name: 'Allow all', exact: true })
        .isVisible({ timeout: 3000 });
      if (isVisible) {
        console.log('cookie is visible ');
        await page
          .getByRole('button', { name: 'Allow all', exact: true })
          .click();
      }

      if (body['invitation']['createInvitation']) {
        console.log('create new invitation');
        return await this.handlIvitation(body, page, 1);
      } else {
        console.log('use already invitation');
        return await this.handlWithAlreadyInvitation(body, page);
      }
    } catch (e) {
      Logger.error('automation says: ', e.message);
    } finally {
      if (page) await page.close();
      if (context) await context.close();
      if (browser) await browser.close();
    }
  }

  async handlClick(page: Page) {
    try {
      await page.getByRole('listitem').click();
      const check = (await page.getByRole('listitem').innerHTML()).includes(
        'disabled=""',
      );
      if (!check) {
        await page.locator('div.arco-modal-footer span > button').click();
        await page.waitForTimeout(1000);
      } else {
        await page.getByLabel('Close').click();
      }
    } catch (e) {
      Logger.error('handlClick says: ', e.message);
    }
  }

  async getInv(invName: string, page: Page): Promise<GetInvDto> {
    try {
      for (;;) {
        const first = await page
          .getByRole('textbox', { name: 'Search by invitation name' })
          .isVisible({ timeout: 3000 });

        const second = await page
          .getByPlaceholder('Search by invitation name')
          .isVisible({ timeout: 3000 });

        const third = await page
          .getByRole('textbox', { name: 'Search invitation by name' })
          .isVisible({ timeout: 3000 });

        if (first) {
          await page
            .getByRole('textbox', { name: 'Search by invitation name' })
            .fill(`${invName.slice(0, invName.length / 2)}`);
          break;
        }
        if (second) {
          await page
            .getByPlaceholder('Search by invitation name')
            .fill(`${invName.slice(0, invName.length / 2)}`);
          break;
        }
        if (third) {
          await page
            .getByRole('textbox', { name: 'Search invitation by name' })
            .fill(`${invName.slice(0, invName.length / 2)}`);
          break;
        }
      }

      await page.keyboard.press('Enter');
      await page.waitForTimeout(1500);
      const invitationFound = await page
        .getByText(invName, { exact: true })
        .first()
        .isVisible({ timeout: 7000 });
      if (!invitationFound) {
        return { message: StatusType.isNotFound };
      }
      const isDisabled = (
        await page
          .getByText(invName, { exact: true })
          .first()
          .locator('..')
          .locator('..')
          .locator('..')
          .innerHTML()
      ).includes('disabled=""');
      const html = (
        await page
          .getByText(invName, { exact: true })
          .first()
          .locator('..')
          .locator('..')
          .locator('span')
          .nth(3)
          .innerHTML()
      ).trim();
      if (html === '50 creators invited') {
        await page.getByLabel('Close').first().click();
        return { message: StatusType.isReachedMax };
      }
      if (isDisabled) {
        await page.getByLabel('Close').first().click();
        return { message: StatusType.isDisabled };
      } else {
        await page.getByText(invName, { exact: true }).first().click();
        return { message: StatusType.isEnabled };
      }
    } catch (e) {
      Logger.error('getInv says: ', e.message);
    }
  }

  async sendingInvitation(
    invitationName: string,
    numberInvites: number,
    page: Page,
    inv: number,
  ) {
    let b = 0;
    try {
      let checkAlreadyInv = 0;

      for (let i = 1; ; i++) {
        const isVisible = await page
          .getByRole('button', { name: 'Allow all', exact: true })
          .isVisible({ timeout: 3000 });
        if (isVisible) {
          console.log('cookie is visible ');
          await page
            .getByRole('button', { name: 'Allow all', exact: true })
            .click();
        }
        console.log('invitation number :', inv);
        b = i;

        const button = page.locator(
          `tr:nth-of-type(${i}) span > div > span button`,
        );

        if (await button.isDisabled()) continue;
        await button.scrollIntoViewIfNeeded();
        await button.click();
        const { message } = await this.getInv(invitationName, page);
        if (message === StatusType.isReachedMax) {
          return { message: 'the invitation you provide is reached max' };
        } else if (message === StatusType.isNotFound) {
          return {
            isSuccess: false,
            message: 'invitation you provide is not found',
          };
        } else if (message === StatusType.isEnabled) {
          const send = page.locator('div.arco-modal-footer span > button');
          await send.click();
          try {
            await page
              .locator('div.arco-modal-footer span > button')
              .waitFor({ state: 'hidden' });
          } catch (e) {
            console.log('eoor close', e.message);
            await page.getByLabel('Close').click();
            continue;
          }
          const isSentInv = page.locator('span.arco-message-content');
          if (await isSentInv.isVisible()) {
            console.log('invitation is sent successfuly');
            inv++;
          } else {
            checkAlreadyInv++;
            console.log('after send inv');

            const isVisible = await page
              .getByRole('button', { name: 'Close' })
              .isVisible({ timeout: 3000 });
            if (isVisible) {
              await page.getByRole('button', { name: 'Close' }).click();
            } else {
              console.log('is not visible after send inv');
              await page.screenshot({ path: 'afterSend.png' });
              continue;
            }
            if (checkAlreadyInv === 3) {
              const AllInviteButtons = await page
                .locator('tr span > div > span button')
                .count();
              i = AllInviteButtons - 1;
              checkAlreadyInv = 0;
            }
          }
        }
        if (inv === numberInvites) {
          return { isSuccess: true, message: 'im done' };
        }
      }
    } catch (e) {
      const code = await page.content();
      fs.writeFileSync('code.html', JSON.stringify(code));
      await page.screenshot({ path: 'errorSending.png' });
      console.log(e.message);
      return {
        isSuccess: true,
        message:
          'all creators with this filters already invited with this product or products',
      };
      console.log(e);
      Logger.error('sendingInvitation says: ', e.message);
      if (page.getByLabel('Close').first().isVisible({ timeout: 4000 }))
        await page.getByLabel('Close').first().click();
    }
  }

  async firstStepCI(
    page: Page,
    invitationDetails: {
      name: string;
      date: string;
      message: string;
      productIds: Array<string>;
      autoApprove: boolean;
      rates: Array<string>;
    },
    names: string[],
    index: number,
  ) {
    try {
      await page
        .getByRole('button', { name: 'Create invitation Info missing' })
        .click();
      await page
        .getByPlaceholder('Invitation name')
        .fill(`${invitationDetails.name}`);
      await page.getByPlaceholder('End date').fill(`${invitationDetails.date}`);

      await page.getByPlaceholder('End date').press('Enter');
      await page
        .getByPlaceholder(
          'You may want to include:\n     1. Your shop or brand introduction\n     2. Purpose',
        )
        .fill(`${invitationDetails.message}`);
      const res = await this.secondStepCI(
        page,
        invitationDetails,
        names,
        index,
      );
      return res;
    } catch (e) {
      Logger.error('firstStepCreateInv says: ', e.message);
    }
  }

  async secondStepCI(
    page: Page,
    invitationDetails: {
      name: string;
      date: string;
      message: string;
      productIds: Array<string>;
      autoApprove: boolean;
      rates: Array<string>;
    },
    names: string[],
    index: number,
  ) {
    try {
      await page
        .getByRole('button', { name: 'Choose products No products' })
        .click();
      await page.getByRole('button', { name: 'Add products' }).click();
      const res = await this.addProducts(invitationDetails.productIds, page);
      if (!res.isSuccess) {
        return res;
      }
      const isVisible = await page
        .getByRole('button', { name: 'Allow all', exact: true })
        .isVisible({ timeout: 3000 });
      if (isVisible) {
        console.log('cookie is visible ');
        await page
          .getByRole('button', { name: 'Allow all', exact: true })
          .click();
      }
      await page.getByRole('button', { name: 'Add', exact: true }).click();
      await page.waitForTimeout(3000);
      const duplicateInv = page.locator('text=Duplicate invitations');
      if (await duplicateInv.isVisible()) {
        await page
          .locator('div')
          .filter({ hasText: /^Duplicate invitations$/ })
          .locator('path')
          .click();
        await page
          .getByRole('button', { name: 'Choose creators 1 invited' })
          .click();
        await page
          .locator('tbody > tr > td:nth-child(3) > div > span > button')
          .click();
        await page.getByPlaceholder('Search creators by username').click();
        await page
          .getByPlaceholder('Search creators by username')
          .fill(names[index]);
        await page.locator('.arco-list-item-content > .flex-c').click();
        return this.secondStepCI(page, invitationDetails, names, index + 1);
      } else {
        const res = await this.handlCommissionRate(
          invitationDetails.rates,
          page,
        );
        if (!res.isSuccess) {
          return res;
        }
        await page
          .getByRole('row', { name: 'Product Price Standard' })
          .locator('label div')
          .click();

        return await this.thirdStepCI(page, invitationDetails);
      }
    } catch (e) {
      await page.screenshot({ path: 'error.png' });
      Logger.error('secondStepCreateInv says: ', e.message);
      return { isSuccess: false, message: 'second step unkown error' };
    }
  }

  async thirdStepCI(
    page: Page,
    invitationDetails: {
      name: string;
      date: string;
      message: string;
      productIds: Array<string>;
      autoApprove: boolean;
      rates: Array<string>;
    },
  ) {
    try {
      await page.getByRole('button', { name: 'Set up free samples' }).click();
      invitationDetails.autoApprove
        ? await page.locator('.arco-radio-mask').first().click()
        : await page
            .locator(
              'label:nth-child(2) > div > div > .arco-icon-hover > .arco-radio-mask',
            )
            .click();
      return await this.lastStepCI(page);
    } catch (e) {
      Logger.error('thirdStepCi says: ', e.message);
    }
  }

  async lastStepCI(page: Page) {
    try {
      await page.getByRole('button', { name: 'Choose creators' }).click();
      await page
        .getByRole('row', { name: 'Creators' })
        .locator('label div')
        .click();
      await page.getByRole('button', { name: 'Send' }).click();
      await page.waitForTimeout(3000);
      await page.goto(
        'https://affiliate-us.tiktok.com/connection/creator?shop_region=US',
      );
      await page.waitForTimeout(1000);
      return { isSuccess: true, message: '' };
    } catch (e) {
      Logger.error('lastStepCi says: ', e.message);
      return { isSuccess: false, message: 'lastStepCI' };
    }
  }

  async createInvitation(
    body: any,
    page: Page,
    index: number,
    names: string[],
  ) {
    try {
      const invitationDetails: {
        name: string;
        date: string;
        message: string;
        productIds: Array<string>;
        autoApprove: boolean;
        rates: Array<string>;
      } = body['invitation']['invitationDetails'];
      return await this.firstStepCI(page, invitationDetails, names, index);
    } catch (e) {
      Logger.error(
        'something went wrong while creating invitation : ',
        e.message,
      );
      return {
        isSuccess: false,
        message: 'somthing happend in create invitation 1',
      };
    }
  }

  async handlCommissionRate(rates: Array<string>, page: Page) {
    try {
      for (let [index, rate] of rates.entries()) {
        await page.getByPlaceholder('-80.00').nth(index).fill(`${rate}`);
      }
      return { isSuccess: true, message: '' };
    } catch (e) {
      return {
        isSuccess: false,
        message: 'something happend in handlCommisionRate',
      };
    }
  }

  async addProducts(products: Array<string>, page: Page) {
    try {
      for (let product of products) {
        console.log('this is the product', product);
        await page
          .locator('tr', { hasText: product })
          .locator('label div')
          .scrollIntoViewIfNeeded();
        const isEnabled = await page
          .locator('tr', { hasText: product })
          .locator('label div')
          .isEnabled();

        if (isEnabled) {
          await page
            .locator('tr', { hasText: product })
            .locator('label div')
            .click();
        } else {
          return {
            isSuccess: false,
            message: `create Invitation faild : the product ${product} is Out of stock or Unavailable`,
          };
        }
      }
      return { isSuccess: true, message: 'adding product seccussfuly' };
    } catch (e) {
      Logger.error('addProducts says: ', e.message);
    }
  }

  async filter(filter: any, page: Page) {
    try {
      filter.creators && (await this.handlCreators(filter.creators, page));
      filter.followers && (await this.handlFollowrs(filter.followers, page));
      filter.performance &&
        (await this.handlPerformance(filter.performance, page));
    } catch (e) {
      Logger.error('filter says: ', e.message);
    }
  }

  async handlPerformance(performance: any, page: Page) {
    try {
      await page.getByRole('button', { name: 'Performance' }).click();
      performance['GMV'] && (await this.handGmv(performance['GMV'], page));
      performance['Engagement rate'] &&
        (await this.handlEngagementRate(performance['Engagement rate'], page));
      performance['Items sold'] &&
        (await this.handlItemsSold(performance['Items sold'], page));
      performance['Est. post rate'] &&
        (await this.handlEstpostrate(performance['Est. post rate'], page));
      performance['Average views per video'] &&
        (await this.handlAverageViewsPerVideo(
          performance['Average views per video'],
          page,
        ));
      performance['Average views per live'] &&
        (await this.handlAverageViewsPerLive(
          performance['Average views per live'],
          page,
        ));
      performance['Brand collaborations'] &&
        (await this.handlBrandCollaborations(
          performance['Brand collaborations'],
          page,
        ));
    } catch (e) {
      Logger.error('handlPerformance says:', e.message);
    } finally {
      await page.getByRole('button', { name: 'Performance' }).click();
    }
  }

  async extractIdsForCreateInvitation(data) {
    try {
      const ret: string[] = [];
      data.map((item) => {
        ret.push(item.creator_oecuid.value);
      });

      return ret;
    } catch (e) {
      Logger.error('extractIdsForCreateInvitation says:', e.message);
    }
  }

  // i need a method that sleep for 6 second
  async sleep(ms = 3000) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async checkProduct(cookie: string, product: string) {
    try {
      const products = await this.getProducts(cookie);

      const isExist = products.products.find(
        (item) => item.product_id === product,
      );
      if (!isExist) {
        return {
          isSuccess: false,
          message: 'the product that you provide is not found',
        };
      }
      const status = isExist.status;
      console.log('this is the status ', isExist.status);
      switch (status) {
        case 1:
          return { isSuccess: true, message: 'the product is available' };
        case 2:
          return { isSuccess: false, message: 'the product is out of stock' };
        case 6:
          return {
            isSuccess: false,
            message: 'the product that you provide is not available',
          };
        default:
          return {
            isSuccess: false,
            message:
              'the product that you provide is not available or out of stock',
          };
      }
    } catch (e) {
      Logger.error('checkProduct says:', e.message);
    }
  }

  private convertDateToUnixTimestamp(dateString: string): number {
    const [month, day, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(23, 59, 59, 0);
    return date.getTime();
  }

  async createInvitationRequest(
    invitationGroup: InvitationGroup,
    cookie: string,
  ) {
    try {
      console.log('this is the auto approve', invitationGroup.autoAprove);
      console.log('this email', invitationGroup.email);
      console.log('this name', invitationGroup.name);
      console.log('this message', invitationGroup.message);
      console.log('this product ids', invitationGroup.products);
      const res = await this.checkProduct(
        cookie,
        invitationGroup.products.product_id,
      );
      if (!res.isSuccess) {
        return res;
      }

      if (!this.isValidFutureDate(invitationGroup.endTime)) {
        return {
          isSuccess: false,
          message:
            'Create invitation failed : the selected date is not valid. Please choose a date after today.',
        };
      }
      const url =
        'https://affiliate-us.tiktok.com/api/v1/oec/affiliate/seller/invitation_group/create?user_language=en&app_name=i18n_ecom_alliance&device_id=0&device_platform=web&cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=en-US&browser_platform=Linux%20x86_64&browser_name=Mozilla&browser_version=5.0%20(X11%3B%20Linux%20x86_64)%20AppleWebKit%2F537.36%20(KHTML,%20like%20Gecko)%20Chrome%2F133.0.0.0%20Safari%2F537.36&browser_online=true&shop_region=US';
      console.log('this is the endTIme', invitationGroup.endTime);
      const time = this.convertDateToUnixTimestamp(invitationGroup.endTime);
      console.log('this is the time', time);
      const creators = await this.getIdsForCreateInv(cookie);
      let creator = creators[0];
      console.log('this is the creator number one', creator);

      const headers = this.getHeaders(cookie);
      for(let i = 0;;i++){
        const body = {
          invitation_group: {
            name: invitationGroup.name,
            message:
              invitationGroup.message,
            contacts_info: [
              { title: '', field: 7, value: invitationGroup.email },
              { title: '', field: 46, value: '', country_code: 'US#1' },
            ],
            free_sample_rule: {
              has_free_sample: true,
              is_free_sample_auto_review: invitationGroup.autoAprove,
            },
            end_time: `${time}`,
            product_list: [
              { product_id: invitationGroup.products.product_id , target_commission: invitationGroup.products.target_commission * 100 },
            ],
            creator_id_list: [
              {
                base_info: {
                  creator_id: '',
                  nick_name: '',
                  creator_oec_id: creators[i],
                },
              },
            ],
            delivery_requirements: { content_option: 1 },
          },
        };
        
        console.log('this is the response of check product', res);
  
        const response = await axios.post(url, body, { headers });
        if(response.data.data.invitation){
          return {isSuccess: true, message: 'invitation created successfuly'}
        }else if (response.data.data.conflict_list){
          console.log('is not create the invitation');
          continue;
        }
        // return response.data;
      }

    } catch (e) {
      Logger.error('createInvitationRequest says:', e.message);
    }
  }

  async getIdsForCreateInv(cookie: string) {
    try {
      const data: string[] = [];
      let page = 1;
      let next_item_cursor = 12;
      let search_key = '';
      // const firstbody
      const firstBody = {
        query: '',
        pagination: { size: 12, next_item_cursor: 12, page: 1 },
        filter_params: {},
        algorithm: 1,
      };
      let index = 0;
      for (;;) {
        const body =
          index === 0
            ? firstBody
            : {
                query: '',
                pagination: {
                  size: 12,
                  search_key: `${search_key}`,
                  next_item_cursor: next_item_cursor,
                  page: page,
                },
                filter_params: {},
                algorithm: 1,
              };
        const url =
          'https://affiliate-us.tiktok.com/api/v1/oec/affiliate/creator/marketplace/find?user_language=en&aid=4331&app_name=i18n_ecom_alliance&device_id=0&fp=verify_m7t6el8u_MnnwfIyJ_vZRS_44ou_BO52_5OgWzavt3SxU&device_platform=web&cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=en-US&browser_platform=Linux%20x86_64&browser_name=Mozilla&browser_version=5.0%20(X11%3B%20Linux%20x86_64)%20AppleWebKit%2F537.36%20(KHTML,%20like%20Gecko)%20Chrome%2F133.0.0.0%20Safari%2F537.36&browser_online=true&shop_region=US';
        const headers = this.getHeaders(cookie);
        const res = await axios.post(url, body, { headers });
        search_key = res.data.next_pagination.search_key;
        next_item_cursor = res.data.next_pagination.next_item_cursor;
        page = res.data.next_pagination.next_page;
        const newdata = await this.extractIdsForCreateInvitation(
          res.data.creator_profile_list,
        );

        data.push(...newdata);
        if (index === 1) break;
        await this.sleep(3000);
        index++;
      }
      return data;
    } catch (e) {
      Logger.error('getIdsForCreateInv says:', e.message);
    }
  }

  async sendRequest() {
    try {
      const response = await axios.post(
        'https://affiliate-us.tiktok.com/api/v1/oec/affiliate/creator/marketplace/find?user_language=en&aid=4331&app_name=i18n_ecom_alliance&device_id=0&fp=verify_m7t6el8u_MnnwfIyJ_vZRS_44ou_BO52_5OgWzavt3SxU&device_platform=web&cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=en-US&browser_platform=Linux%20x86_64&browser_name=Mozilla&browser_version=5.0%20(X11%3B%20Linux%20x86_64)%20AppleWebKit%2F537.36%20(KHTML,%20like%20Gecko)%20Chrome%2F133.0.0.0%20Safari%2F537.36&browser_online=true&shop_region=US',
        {
          query: '',
          pagination: { size: 12, page: 0 },
          filter_params: {
            category_list: [
              { string_list: ['600001', '851848'] },
              { string_list: ['600001', '851976'] },
              { string_list: ['600001', '852104'] },
              { string_list: ['600001', '852232'] },
              { string_list: ['600001', '852360'] },
              { string_list: ['600001', '852488'] },
              { string_list: ['600001', '852616'] },
            ],
          },
          algorithm: 1,
        },
        {
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Content-Type': 'application/json',
            Origin: 'https://affiliate-us.tiktok.com',
            Referer:
              'https://affiliate-us.tiktok.com/connection/creator?shop_region=US',
            'User-Agent':
              'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
            Cookie:
              'passport_csrf_token=b7b78fe74755f1b30d8db4d0072684a1; passport_csrf_token_default=b7b78fe74755f1b30d8db4d0072684a1; _ga=GA1.1.2026445519.1739360526; _tt_enable_cookie=1; FPID=FPID2.2.ZjZcNrmZUnw3ve7kIgeYie8yDtRD%2FxPN%2BtqSX2et6sU%3D.1739360526; FPAU=1.2.1437566847.1739360526; _fbp=fb.1.1739360525652.1257588671; tt_ticket_guard_client_web_domain=2; sso_auth_status_ads=56ec36ac3003a4080d09ff1fd462eb00; sso_auth_status_ss_ads=56ec36ac3003a4080d09ff1fd462eb00; i18next=en; multi_sids=7471229008854074399%3A1ebd3b5cf2a7d2aaa1192900ba80bc68; cmpl_token=AgQQAPNSF-RO0reRzZSMZZ0m_c6wHBGQP53ZYNn6Jg; passport_auth_status=4443e2ce9e751796e5287fbccaa206ef%2C; passport_auth_status_ss=4443e2ce9e751796e5287fbccaa206ef%2C; uid_tt=744cde5be252bf1b7ec1b65510d9f17e2c883b4161bdee2f928d3ed616156687; uid_tt_ss=744cde5be252bf1b7ec1b65510d9f17e2c883b4161bdee2f928d3ed616156687; sid_tt=1ebd3b5cf2a7d2aaa1192900ba80bc68; sessionid=1ebd3b5cf2a7d2aaa1192900ba80bc68; sessionid_ss=1ebd3b5cf2a7d2aaa1192900ba80bc68; store-idc=useast5; tt-target-idc=useast5; tt-target-idc-sign=LgocGSBsLbLZfYrfCn03D6hOKCdaMOJVlOelAK79LBy2e5tlHfneWbWCxK_od2yUjjzF8BhWCbH-opq_fT4HwC6jFzB6Xl_aejtm6Te9l4DgFwgDN1k0sjdZxcG5Brz8WOHXU3hwoT6FlQJdzDfYMyOMzF_7YnhCXuFYFq6sU2T-H9r3QmVqiwIDWnGZvUYY0TRecAOLJvFKtDUfqNDAfwjcoiDTwMg6qfJIclS-GWrJt2cBiuAFmJkEwaYLMTqgfsFmm2PQiyDjkl3yj9PfoB9B9pS7MPQe8x28ML9eEcA2Ur6w_tPlTvbFwFBZMF_IcDxus4p47lmZzvizft_QGTz822qKCCB2kJLTToZcKb1FHCY0hlIdNkVShLPanEjKEw2PQInXZvk4sLbReIF0T57gFBKicrSO2hzUofQYGT9N3DrUH4-k-qoyfALdKiG4597owjT5TGudik3sXXQec1Sqwa25M7aYqw8n2BoPv05zh0ssWo_vyFzjYbiUxU5K; sid_guard=1ebd3b5cf2a7d2aaa1192900ba80bc68%7C1739532660%7C15551971%7CWed%2C+13-Aug-2025+11%3A30%3A31+GMT; sid_ucp_v1=1.0.0-KGEwM2IzYTVhZjUyN2U1NzA2NGE2NDg1ZWJhNzNkYjU0ZTQ4ZDE5YmYKGQifiN2isObI12cQ9NK8vQYYsws4CEASSAQQBBoHdXNlYXN0NSIgMWViZDNiNWNmMmE3ZDJhYWExMTkyOTAwYmE4MGJjNjg; ssid_ucp_v1=1.0.0-KGEwM2IzYTVhZjUyN2U1NzA2NGE2NDg1ZWJhNzNkYjU0ZTQ4ZDE5YmYKGQifiN2isObI12cQ9NK8vQYYsws4CEASSAQQBBoHdXNlYXN0NSIgMWViZDNiNWNmMmE3ZDJhYWExMTkyOTAwYmE4MGJjNjg; SHOP_ID=7290945569479016747; d_ticket_ads=f4835e6e4a4c824f833e9011acd8e966118c9; msToken=QzU7X4y9PcYWQ56oEpDvSRD8Msavd2mju5a3sPnNxK6ozGEIfd9ssDlOot6zOYjrJrDy7c2aNuRPYTxWXpNoVeOrXA3bbtfknOAW79AB7uQsfVyWB6bjBJOWXJxu65N1w-zLjBs=; _m4b_theme_=new; tt_ticket_guard_client_data=eyJ0dC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwidHQtdGlja2V0LWd1YXJkLWl0ZXJhdGlvbi12ZXJzaW9uIjoxLCJ0dC10aWNrZXQtZ3VhcmQtcHVibGljLWtleSI6IkJIbDZMM1NUNjVnSnN1aGFIV01SdlRjSFJoR1dkUGVtdEM5TzY1TEpzRlVSQlRaK09jeU9rSzZnM2gvYWtUME5uOTR4dk5oenhWVktHZURmaHphdmFjYz0iLCJ0dC10aWNrZXQtZ3VhcmQtd2ViLXZlcnNpb24iOjF9; sso_uid_tt_ads=d593be99364e66b476650c2da04fecdda32ee6382a007e57d7985a011c957dab; sso_uid_tt_ss_ads=d593be99364e66b476650c2da04fecdda32ee6382a007e57d7985a011c957dab; sso_user_ads=6176c5b9ceb6f30e7c409ee0f04a37da; sso_user_ss_ads=6176c5b9ceb6f30e7c409ee0f04a37da; sid_ucp_sso_v1_ads=1.0.0-KDdhMWU4MGFhOWRlZmMxZmQ4MGM0NWFiZmJhNjY0N2E2NDIyNTRmZDUKGgiGiLXk2bf7g2cQ8YyIvgYY5B84AUDrB0gGEAMaAm15IiA2MTc2YzViOWNlYjZmMzBlN2M0MDllZTBmMDRhMzdkYQ; ssid_ucp_sso_v1_ads=1.0.0-KDdhMWU4MGFhOWRlZmMxZmQ4MGM0NWFiZmJhNjY0N2E2NDIyNTRmZDUKGgiGiLXk2bf7g2cQ8YyIvgYY5B84AUDrB0gGEAMaAm15IiA2MTc2YzViOWNlYjZmMzBlN2M0MDllZTBmMDRhMzdkYQ; _ga_BZBQ2QHQSP=GS1.1.1740768766.6.1.1740768881.0.0.1988687674; sid_guard_tiktokseller=1556e062413034331a2d779284f7570c%7C1740768883%7C863998%7CMon%2C+10-Mar-2025+18%3A54%3A41+GMT; uid_tt_tiktokseller=386072d07115b3bda4d6b32619145855f1e476314650bdefb91107fad9fe72e1; uid_tt_ss_tiktokseller=386072d07115b3bda4d6b32619145855f1e476314650bdefb91107fad9fe72e1; sid_tt_tiktokseller=1556e062413034331a2d779284f7570c; sessionid_tiktokseller=1556e062413034331a2d779284f7570c; sessionid_ss_tiktokseller=1556e062413034331a2d779284f7570c; sid_ucp_v1_tiktokseller=1.0.0-KDU2OWJjOWM1ZTdmNzdmMmI4MzA2N2U5MjE3MzZkZTljNDRjYTdlZWIKHAiGiLXk2bf7g2cQ84yIvgYY5B8gDDgBQOsHSAQQBBoHdXNlYXN0NSIgMTU1NmUwNjI0MTMwMzQzMzFhMmQ3NzkyODRmNzU3MGM; ssid_ucp_v1_tiktokseller=1.0.0-KDU2OWJjOWM1ZTdmNzdmMmI4MzA2N2U5MjE3MzZkZTljNDRjYTdlZWIKHAiGiLXk2bf7g2cQ84yIvgYY5B8gDDgBQOsHSAQQBBoHdXNlYXN0NSIgMTU1NmUwNjI0MTMwMzQzMzFhMmQ3NzkyODRmNzU3MGM; _ttp=2tizRSDfiOcZDix2goGAhIDEYbw; tt_csrf_token=DDzW8ky6-HQoFsTr4pFxgKvqcAoUsH3LEJ_U; tt_chain_token=JEpJED4PrvFU0N9QLsmTgA==; store-country-code=us; store-country-code-src=uid; ttwid=1%7C6hPWgEKmo56S7d3Nhr0FGnezgmAsaktKrx6-_B1xlrk%7C1741005198%7C28d1adb3d10f0b6fe9f18ef631de64c9f344fc46669b3d6ff293834622bf0a7e; msToken=B3DXOL0F2T8yC7kVbAX9a0Eenn31Gjw3X8sd4R7rVEDP24dmUAnymuMJh76wKH6rGW0U8jsFTBNJ51GLecsSYvClC3IhF1ZqjMu8YU8QEVpIiY-4P5JGbN13L_iAfDZiAFTkCI0WuESjUMTBi2G7ezSm; s_v_web_id=verify_m7t6el8u_MnnwfIyJ_vZRS_44ou_BO52_5OgWzavt3SxU; odin_tt=97e039c67f261d74b22695041aadbbc430113c3794eb69ebaac83084e4976bf40a7cf8aa590c7f00c8203ff8b67d91613f5c6e4fac9687d2dce060f7df2ea8ff; user_oec_info=0a5387008ba17265fcd64603cb25761cf96e1ced888769782c42faeeb1abb493a440a9267a2928fa84da996ad9b337594e0fb82a5a5857bef534fea9205a84e307c77cb13be58d6d372486962922ec6461b52cff931a490a3cdd6c6cf152fcf8a42063b636c4db98c36d3b957e6997e3d84b72064efd9eec360f64d68b957fce98dd1195eae334fbca37ec7b2d2a38fcb1f64068c010ff91eb0d1886d2f6f20d2201041a530e5c',
            'Sec-Ch-Ua':
              '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Linux"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
          },
        },
      );

      console.log(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  getHeaders(cookie: string) {
    try {
      const headers = {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        origin: 'https://affiliate-us.tiktok.com',
        priority: 'u=1, i',
        referer:
          'https://affiliate-us.tiktok.com/connection/target-invitation/create?enter_from=affiliate_find_creators&enter_method=target_invite&pair_source=author_recommend&creator_ids[0]=7493999545809013414&shop_region=US',
        'sec-ch-ua':
          '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        Cookie: cookie,
      };
      return headers;
    } catch (e) {
      Logger.error('getHeaders says:', e.message);
    }
  }

  async getProducts(cookies: string) {
    const url =
      'https://affiliate-us.tiktok.com/api/v1/affiliate/product_selection/list?user_language=en&aid=4331&app_name=i18n_ecom_alliance&device_id=0&fp=verify_m7t6el8u_MnnwfIyJ_vZRS_44ou_BO52_5OgWzavt3SxU&device_platform=web&cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=en-US&browser_platform=Linux%20x86_64&browser_name=Mozilla&browser_version=5.0%20(X11%3B%20Linux%20x86_64)%20AppleWebKit%2F537.36%20(KHTML,%20like%20Gecko)%20Chrome%2F133.0.0.0%20Safari%2F537.36&browser_online=true&shop_region=US';

    const headers = this.getHeaders(cookies);
    const body = {
      page_size: 100,
      cur_page: 1,
      source: 2,
      search_params: [{ key: 1, search_type: 1, value: '' }],
    };
    const res = await axios.post(url, body, {
      headers,
    });
    return res.data;
  }

  async handlBrandCollaborations(brands: Array<string>, page: Page) {
    try {
      await page.getByRole('button', { name: 'Brand collaborations' }).click();
      for (let brand of brands) {
        await page.locator('input.arco-input-tag-input').fill(`${brand}`);
        await page
          .getByRole('option', { name: `${brand}` })
          .locator('span')
          .nth(1)
          .click();
      }
    } catch (e) {
      Logger.error('handlBrandCollaborations says:', e.message);
    }
  }

  async handlAverageViewsPerVideo(avrageViews: any, page: Page) {
    try {
      await page
        .getByRole('button', { name: 'Average views per video' })
        .click();

      const value = avrageViews['value'];
      const filtredByShoppableVideo = avrageViews['Filter by shoppable videos'];
      await page
        .locator('#filter-container')
        .getByRole('textbox')
        .fill(`${value}`);
      if (filtredByShoppableVideo) {
        await page
          .getByText('Filter by shoppable videos', { exact: true })
          .click();
      }
    } catch (e) {
      Logger.error('handlAverageViewsPerVideo says:', e.message);
    } finally {
      await page
        .getByRole('button', { name: 'Average views per video' })
        .click();
    }
  }

  async handlAverageViewsPerLive(avrageViews: any, page: Page) {
    try {
      await page
        .getByRole('button', { name: 'Average viewers per Live' })
        .click();

      const value = avrageViews['value'];
      const filtredByShoppableLive =
        avrageViews['Filter by shoppable LIVE videos'];
      await page
        .locator('#filter-container')
        .getByRole('textbox')
        .fill(`${value}`);
      if (filtredByShoppableLive) {
        await page
          .getByText('Filter by shoppable LIVE videos', { exact: true })
          .click();
      }
    } catch (e) {
      Logger.error('handlAverageViewsPerVideo says:', e.message);
    } finally {
      await page
        .getByRole('button', { name: 'Average viewers per Live' })
        .click();
    }
  }

  async handGmv(gmv: Array<string>, page: Page) {
    try {
      await page.getByRole('button', { name: 'GMV' }).click();
      for (let item of gmv) {
        switch (item) {
          case '$0-$100':
            await page.getByText('$0-$').nth(0).click();
            break;
          case '$100-$1K':
            await page
              .locator('#arco-select-popup-5')
              .getByText('$100-$1K')
              .click();
            break;
          case '$1K-$10K':
            await page.getByText('$1K-$10K').click();
            break;
          case '$10K+':
            await page.getByText('$10K+').click();
            break;
          default:
            break;
        }
      }
    } catch (e) {
      Logger.error('handGmv says:', e.message);
    } finally {
      await page.getByRole('button', { name: 'GMV' }).click();
    }
  }

  async handlItemsSold(items: Array<string>, page: Page) {
    try {
      await page.getByRole('button', { name: 'Items sold' }).click();
      for (let item of items) {
        await page.getByText(item, { exact: true }).click();
      }
    } catch (e) {
      Logger.error('handlItemsSold says:', e.message);
    } finally {
      await page.getByRole('button', { name: 'Items sold' }).click();
    }
  }

  async handlEstpostrate(item: string, page: Page) {
    try {
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: 'Est. post rate' }).click();
      await page.getByRole('option', { name: item }).click();
    } catch (e) {
      Logger.error('handlEstpostrate says:', e.message);
    }
  }

  async handlEngagementRate(engagementRate: any, page: Page) {
    try {
      const value = engagementRate['value'];
      const filtredByShoppableVideo =
        engagementRate['Filter by shoppable videos'];
      await page.getByRole('button', { name: 'Engagement rate' }).click();
      await page
        .locator('#filter-container')
        .getByRole('textbox')
        .fill(`${value}`);
      if (filtredByShoppableVideo) {
        await page.getByText('Filter by shoppable videos').click();
      }
    } catch (e) {
      Logger.error('handlEngagementRate says:', e.message);
    } finally {
      await page.getByRole('button', { name: 'Engagement rate' }).click();
    }
  }

  async handlFollowrs(followers: any, page: Page) {
    try {
      await page.getByRole('button', { name: 'Followers' }).click();
      followers['Follower age'] &&
        (await this.handlFollowerAge(followers['Follower age'], page));
      followers['Follower gender'] &&
        (await this.handlFollowerGender(followers['Follower gender'], page));
    } catch (e) {
      Logger.error('handlFollowers says:', e.message);
    } finally {
      await page.getByRole('button', { name: 'Followers' }).click();
      await page.waitForTimeout(1000);
    }
  }

  async handlFollowerAge(age: string, page: Page) {
    try {
      await page.getByRole('button', { name: 'Follower age' }).click();
      await page.getByText(age).click();
    } catch (e) {
      Logger.error('handlFollowerAge says:', e.message);
    } finally {
      await page.getByRole('button', { name: 'Follower age' }).click();
    }
  }

  async handlFollowerGender(gender: string, page: Page) {
    try {
      await page.getByRole('button', { name: 'Follower gender' }).click();
      switch (gender) {
        case 'All':
          await page.getByRole('option', { name: 'All' }).click();
          break;
        case 'Male':
          await page.getByRole('option', { name: 'Male', exact: true }).click();
          break;
        case 'Female':
          await page.getByRole('option', { name: 'Female' }).click();
          break;
        default:
          break;
      }
    } catch (e) {
      Logger.error('handlFollowerGender says:', e.message);
    }
  }

  async handlCreators(creators: any, page: Page) {
    try {
      for (;;) {
        const isVisible = await page
          .getByRole('button', { name: 'Creators' })
          .isVisible({ timeout: 2000 });
        if (isVisible) {
          await page.getByRole('button', { name: 'Creators' }).click();
          break;
        }
      }
      creators.ProductCategory &&
        (await this.handlProductCategory(creators.ProductCategory, page));
      creators['Creator agency'] &&
        (await this.handlCreatorAgency(creators['Creator agency'], page));
      creators['Follower count'] &&
        (await this.handlFollowerCount(creators['Follower count'], page));
      creators['Avg. commission rate'] &&
        (await this.handlAvgCommissionRate(
          creators['Avg. commission rate'],
          page,
        ));
      creators['Content type'] &&
        (await this.handlContentType(creators['Content type'], page));
      creators['Fast growing'] &&
        (await page.getByText('Fast growing').click());
      creators['Not invited in past 90 days'] &&
        (await page.getByText('Not invited in past 90 days').click());
    } catch (e) {
      Logger.error('handlCreators says', e.message);
    } finally {
      await page.getByRole('button', { name: 'Creators' }).click();
      await page.waitForTimeout(1000);
    }
  }

  async handlProductCategory(productCategory: any, page: Page) {
    try {
      await page.getByRole('button', { name: 'Product category' }).click();
      productCategory['Home Supplies'] &&
        (await this.handlHOmeSupplies(productCategory['Home Supplies'], page));
      productCategory['Kitchenware'] &&
        (await this.handlKitchenware(productCategory['Kitchenware'], page));
      productCategory['Textiles & Soft Furnishings'] &&
        (await this.textilesSoftFurnishings(
          productCategory['Textiles & Soft Furnishings'],
          page,
        ));
      productCategory['Household Appliances'] &&
        (await this.handlHouseholdAppliances(
          productCategory['Household Appliances'],
          page,
        ));
      productCategory['Womenswear & Underwear'] &&
        (await this.handlWomenswearUnderwear(
          productCategory['Womenswear & Underwear'],
          page,
        ));

      productCategory['Muslim Fashion'] &&
        (await this.handlMuslimFashion(
          productCategory['Muslim Fashion'],
          page,
        ));

      productCategory['Shoes'] &&
        (await this.handlShoes(productCategory['Shoes'], page));

      productCategory['Beauty & Personal Care'] &&
        (await this.handlBeautyPersonalCare(
          productCategory['Beauty & Personal Care'],
          page,
        ));

      productCategory['Phones & Electronics'] &&
        (await this.handlPhonesElectronics(
          productCategory['Phones & Electronics'],
          page,
        ));

      productCategory['Computers & Office Equipment'] &&
        (await this.handlComputersOfficeEquipment(
          productCategory['Computers & Office Equipment'],
          page,
        ));

      productCategory['Pet Supplies'] &&
        (await this.handlPetSupplies(productCategory['Pet Supplies'], page));

      productCategory['Baby & Maternity'] &&
        (await this.handlBabyMaternity(
          productCategory['Baby & Maternity'],
          page,
        ));
      productCategory['Sports & Outdoor'] &&
        (await this.handlSportsOutdoor(
          productCategory['Sports & Outdoor'],
          page,
        ));

      productCategory['Toys & Hobbies'] &&
        (await this.handlToysHobbies(productCategory['Toys & Hobbies'], page));
      productCategory['Furniture'] &&
        (await this.handlFurniture(productCategory['Furniture'], page));
      productCategory['Tools & Hardware'] &&
        (await this.handlToolsHardware(
          productCategory['Tools & Hardware'],
          page,
        ));

      productCategory['Home Improvement'] &&
        (await this.handlHomeImprovement(
          productCategory['Home Improvement'],
          page,
        ));

      productCategory['Automotive & Motorcycle'] &&
        (await this.handlAutomotiveMotorcycle(
          productCategory['Automotive & Motorcycle'],
          page,
        ));

      productCategory['Fashion Accessories'] &&
        (await this.handlFashionAccessories(
          productCategory['Fashion Accessories'],
          page,
        ));

      productCategory['Food & Beverages'] &&
        (await this.handlFoodBeverages(
          productCategory['Food & Beverages'],
          page,
        ));

      productCategory['Health'] &&
        (await this.handlHealth(productCategory['Health'], page));

      productCategory['Books, Magazines & Audio'] &&
        (await this.handlBooksMagazinesAudio(
          productCategory['Books, Magazines & Audio'],
          page,
        ));

      productCategory["Kids' Fashion"] &&
        (await this.handlKidsFashion(productCategory["Kids' Fashion"], page));

      productCategory['Menswear & Underwear'] &&
        (await this.handlMenswearUnderwear(
          productCategory['Menswear & Underwear'],
          page,
        ));

      productCategory['Luggage & Bags'] &&
        (await this.handlLuggageBags(productCategory['Luggage & Bags'], page));

      productCategory['Collectibles'] &&
        (await this.handlCollectibles(productCategory['Collectibles'], page));
      productCategory['Jewelry Accessories & Derivatives'] &&
        (await this.handlJewelryAccessoriesDerivatives(
          productCategory['Jewelry Accessories & Derivatives'],
          page,
        ));
    } catch (e) {
      await page.screenshot({ path: 'productCategory.png' });
      Logger.error('handlProductCategory says:', e.message);
    } finally {
      await page.getByRole('button', { name: 'Product category' }).click();
    }
  }

  async handlJewelryAccessoriesDerivatives(
    selecters: Array<string> | string,
    page: Page,
  ) {
    try {
      if (selecters === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Jewelry Accessories & Derivatives' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Jewelry Accessories & Derivatives$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of selecters) {
          const element = page.getByText(item, { exact: true });
          await element.scrollIntoViewIfNeeded();
          await element.click();
        }
      }
    } catch (e) {
      Logger.error('handlJewelryAccessoriesDerivatives says:', e.message);
    }
  }

  async handlCollectibles(selecters: Array<string> | string, page: Page) {
    try {
      if (selecters === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Collectibles' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Collectibles$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of selecters) {
          const element = page.getByText(item, { exact: true });
          await element.scrollIntoViewIfNeeded();
          await element.click();
        }
      }
    } catch (e) {
      Logger.error('handlCollectibles says:', e.message);
    }
  }

  async handlLuggageBags(selecters: Array<string> | string, page: Page) {
    try {
      if (selecters === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Luggage & Bags' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Luggage & Bags$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of selecters) {
          const element = page.getByText(item, { exact: true });
          await element.scrollIntoViewIfNeeded();
          await element.click();
        }
      }
    } catch (e) {
      Logger.error('handlLuggageBags says:', e.message);
    }
  }

  async handlMenswearUnderwear(selecters: Array<string> | string, page: Page) {
    try {
      if (selecters === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Menswear & Underwear' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Menswear & Underwear$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of selecters) {
          const element = page.getByText(item, { exact: true });
          await element.scrollIntoViewIfNeeded();
          await element.click();
        }
      }
    } catch (e) {
      Logger.error('handlMenswearUnderwear says:', e.message);
    }
  }

  async handlKidsFashion(selecters: Array<string> | string, page: Page) {
    try {
      if (selecters === 'All') {
        const element = page
          .getByRole('menuitem', { name: "Kids' Fashion" })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Kids\' Fashion$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of selecters) {
          const element = page.getByText(item, { exact: true });
          await element.scrollIntoViewIfNeeded();
          await element.click();
        }
      }
    } catch (e) {
      Logger.error('handlKidsFashion says:', e.message);
    }
  }

  async handlBooksMagazinesAudio(
    selecters: Array<string> | string,
    page: Page,
  ) {
    try {
      if (selecters === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Books, Magazines & Audio' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Books, Magazines & Audio$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of selecters) {
          const element = page.getByText(item, { exact: true });
          await element.scrollIntoViewIfNeeded();
          await element.click();
        }
      }
    } catch (e) {
      Logger.error('handlBooksMagazinesAudio says:', e.message);
    }
  }

  async handlHealth(selecters: Array<string> | string, page: Page) {
    try {
      if (selecters === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Health' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Health$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of selecters) {
          await page.getByText(item, { exact: true }).click();
        }
      }
    } catch (e) {
      Logger.error('handlHealth says:', e.message);
    }
  }

  async handlFoodBeverages(selecters: Array<string> | string, page: Page) {
    try {
      if (selecters === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Food & Beverages' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Food & Beverages$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of selecters) {
          await page.getByText(item, { exact: true }).click();
        }
      }
    } catch (e) {
      Logger.error('handlFoodBeverages says:', e.message);
    }
  }

  async handlFashionAccessories(selecters: Array<string> | string, page: Page) {
    try {
      if (selecters === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Fashion Accessories' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Fashion Accessories$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of selecters) {
          const element = page.getByText(item, { exact: true });
          await element.scrollIntoViewIfNeeded();
          await element.click();
        }
      }
    } catch (e) {
      Logger.error('handlFashionAccessories says:', e.message);
    }
  }

  async handlAutomotiveMotorcycle(
    selecters: Array<string> | string,
    page: Page,
  ) {
    try {
      if (selecters === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Automotive & Motorcycle' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Automotive & Motorcycle$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of selecters) {
          const element = page.getByText(item, { exact: true });
          await element.scrollIntoViewIfNeeded();
          await element.click();
        }
      }
    } catch (e) {
      Logger.error('handlAutomotiveMotorcycle says:', e.message);
    }
  }

  async handlHomeImprovement(selecters: Array<string> | string, page: Page) {
    try {
      if (selecters === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Home Improvement' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Home Improvement$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of selecters) {
          const element = page.getByText(item, { exact: true });
          await element.scrollIntoViewIfNeeded();
          await element.click();
        }
      }
    } catch (e) {
      Logger.error('handlHomeImprovement says:', e.message);
    }
  }

  async handlToolsHardware(selecters: Array<string> | string, page: Page) {
    try {
      if (selecters === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Tools & Hardware' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Tools & Hardware$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of selecters) {
          const element = page.getByText(item, { exact: true });
          await element.scrollIntoViewIfNeeded();
          await element.click();
        }
      }
    } catch (e) {
      Logger.error('handlToolsHardware says:', e.message);
    }
  }

  async handlFurniture(selecters: Array<string> | string, page: Page) {
    try {
      if (selecters === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Furniture' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Furniture$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of selecters) {
          const element = page.getByText(item, { exact: true });
          await element.scrollIntoViewIfNeeded();
          await element.click();
        }
      }
    } catch (e) {
      Logger.error('handlFurniture says:', e.message);
    }
  }

  async handlToysHobbies(selecters: Array<string> | string, page: Page) {
    try {
      if (selecters === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Toys & Hobbies' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Toys & Hobbies$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of selecters) {
          const element = page.getByText(item, { exact: true });
          await element.scrollIntoViewIfNeeded();
          await element.click();
        }
      }
    } catch (e) {
      Logger.error('handlToysHobbies says:', e.message);
    }
  }

  async handlSportsOutdoor(sportsOutdoor: Array<string> | string, page: Page) {
    try {
      if (sportsOutdoor === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Sports & Outdoor' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Sports & Outdoor$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of sportsOutdoor) {
          const element = page.getByText(item, { exact: true });
          await element.scrollIntoViewIfNeeded();
          await element.click();
        }
      }
    } catch (e) {
      Logger.error('handlSportsOutdoor says:', e.message);
    }
  }

  async handlBabyMaternity(babyMaternity: Array<string> | string, page: Page) {
    try {
      if (babyMaternity === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Baby & Maternity' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Baby & Maternity$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of babyMaternity) {
          await page.getByText(item, { exact: true }).click();
        }
      }
    } catch (e) {
      Logger.error('handlBabyMaternity says:', e.message);
    }
  }

  async handlPetSupplies(petSupplies: Array<string> | string, page: Page) {
    try {
      if (petSupplies === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Pet Supplies' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Pet Supplies$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of petSupplies) {
          const element = page.getByText(item, { exact: true });
          await element.scrollIntoViewIfNeeded();
          await element.click();
        }
      }
    } catch (e) {
      Logger.error('handlPetSupplies says:', e.message);
    }
  }

  async handlComputersOfficeEquipment(
    computersOfficeEquipment: Array<string> | string,
    page: Page,
  ) {
    try {
      if (computersOfficeEquipment === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Computers & Office Equipment' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Computers & Office Equipment$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of computersOfficeEquipment) {
          await page.getByText(item, { exact: true }).click();
        }
      }
    } catch (e) {
      Logger.error('handlComputersOfficeEquipment says:', e.message);
    }
  }

  async handlPhonesElectronics(
    phonesElectronics: Array<string> | string,
    page: Page,
  ) {
    try {
      if (phonesElectronics === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Phones & Electronics' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Phones & Electronics$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of phonesElectronics) {
          await page.getByText(item, { exact: true }).click();
        }
      }
    } catch (e) {
      Logger.error('handlPhonesElectronics says:', e.message);
    }
  }

  async handlBeautyPersonalCare(
    beautyPersonalCare: Array<string> | string,
    page: Page,
  ) {
    try {
      if (beautyPersonalCare === 'All') {
        const element = page
          .getByRole('menuitem', { name: 'Beauty & Personal Care' })
          .locator('span div');
        await element.scrollIntoViewIfNeeded();
        await element.click();
      } else {
        const element = page
          .locator('div')
          .filter({ hasText: /^Beauty & Personal Care$/ })
          .locator('svg');
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await page.waitForTimeout(1000);
        for (let item of beautyPersonalCare) {
          const button = page.getByText(item, { exact: true });
          await button.scrollIntoViewIfNeeded();
          await button.click();
        }
      }
    } catch (e) {
      Logger.error('handlBeautyPersonalCare says:', e.message);
    }
  }

  async handlShoes(shoes: Array<string> | string, page: Page) {
    try {
      if (shoes === 'All') {
        await page
          .getByRole('menuitem', { name: 'Shoes', exact: true })
          .locator('span div')
          .click();
      } else {
        await page
          .locator('div')
          .filter({ hasText: /^Shoes$/ })
          .locator('svg')
          .click();
        await page.waitForTimeout(1000);
        for (let item of shoes) {
          const button = page.getByText(item, { exact: true }).first();
          await button.scrollIntoViewIfNeeded();
          await button.click();
        }
      }
    } catch (e) {
      Logger.error('handlShoes says:', e.message);
    }
  }

  async handlMuslimFashion(muslimFashion: Array<string> | string, page: Page) {
    try {
      if (muslimFashion === 'All') {
        await page
          .getByRole('menuitem', { name: 'Muslim Fashion' })
          .locator('span div')
          .click();
      } else {
        await page
          .locator('div')
          .filter({ hasText: /^Muslim Fashion$/ })
          .locator('svg')
          .click();
        await page.waitForTimeout(1000);
        for (let item of muslimFashion) {
          const button = page.getByText(item);
          await button.scrollIntoViewIfNeeded();
          await button.click();
        }
      }
    } catch (e) {
      Logger.error('handlMuslimFashion says:', e.message);
    }
  }

  async handlWomenswearUnderwear(
    womenswearUnderwear: Array<string> | string,
    page: Page,
  ) {
    try {
      if (womenswearUnderwear === 'All') {
        await page
          .getByRole('menuitem', { name: 'Womenswear & Underwear' })
          .locator('span div')
          .click();
      } else {
        await page
          .locator('div')
          .filter({ hasText: /^Womenswear & Underwear$/ })
          .locator('svg')
          .click();
        await page.waitForTimeout(1000);
        for (let item of womenswearUnderwear) {
          const button = page.getByText(item);
          await button.scrollIntoViewIfNeeded();
          await button.click();
        }
      }
    } catch (e) {}
  }

  async handlHOmeSupplies(homeSupplies: Array<string> | string, page: Page) {
    try {
      if (homeSupplies === 'All') {
        await page
          .getByRole('menuitem', { name: 'Home Supplies' })
          .locator('span div')
          .click();
      } else {
        await page
          .locator('div')
          .filter({ hasText: /^Home Supplies$/ })
          .locator('svg')
          .click();

        await page.waitForTimeout(1000);
        for (let item of homeSupplies) {
          const button = page.getByText(item);
          await button.scrollIntoViewIfNeeded();
          await button.click();
        }
      }
    } catch (e) {
      Logger.error('handlHOmeSupplies says: ', e.message);
    }
  }

  async handlKitchenware(kitchenware: Array<string> | string, page: Page) {
    try {
      if (kitchenware === 'All') {
        await page
          .getByRole('menuitem', { name: 'Kitchenware' })
          .locator('span div')
          .click();
      } else {
        await page
          .locator('div')
          .filter({ hasText: /^Kitchenware$/ })
          .locator('svg')
          .click();
        await page.waitForTimeout(1000);
        for (let item of kitchenware) {
          const button = page.getByText(item);
          await button.scrollIntoViewIfNeeded();
          await button.click();
        }
      }
    } catch (e) {
      Logger.error('handlKitchenware says: ', e.message);
    }
  }

  async textilesSoftFurnishings(items: Array<string> | string, page: Page) {
    try {
      if (items === 'All') {
        await page
          .getByRole('menuitem', { name: 'Textiles & Soft Furnishings' })
          .locator('span div')
          .click();
      } else {
        await page
          .locator('div')
          .filter({ hasText: /^Textiles & Soft Furnishings$/ })
          .locator('svg')
          .click();
        await page.waitForTimeout(1000);
        for (let item of items) {
          const button = page.getByText(item);
          await button.scrollIntoViewIfNeeded();
          await button.click();
        }
      }
    } catch (e) {
      Logger.error('textilesSoftFurnishings says: ', e.message);
    }
  }

  async handlHouseholdAppliances(items: Array<string> | string, page: Page) {
    try {
      if (items === 'All') {
        await page
          .getByRole('menuitem', { name: 'Household Appliances' })
          .locator('span div')
          .click();
      } else {
        await page
          .locator('div')
          .filter({ hasText: /^Household Appliances$/ })
          .locator('svg')
          .click();
        await page.waitForTimeout(1000);
        for (let item of items) {
          const button = page.getByText(item);
          await button.scrollIntoViewIfNeeded();
          await button.click();
        }
      }
    } catch (e) {
      Logger.error('handlHouseholdAppliances says: ', e.message);
    }
  }

  async handlCreatorAgency(item: string, page: Page) {
    try {
      await page.getByRole('button', { name: 'Creator agency' }).click();
      await page.getByRole('option', { name: item }).locator('div').click();
    } catch (e) {
      Logger.error('handlCreatorAgency says: ', e.message);
    }
  }

  async handlFollowerCount(
    follower: { min: number | string; max: number | string },
    page: Page,
  ) {
    try {
      const isVisible = await page
        .locator('button', {
          hasText: /Follower size|count/,
        })
        .isVisible({ timeout: 6000 });
      if (isVisible) {
        await page
          .locator('button', {
            hasText: /Follower size|count/,
          })
          .click();
        await page.getByRole('textbox').nth(1).fill(`${follower.min}`);
        await page.getByRole('textbox').nth(2).fill(`${follower.max}`);
        await page
          .locator('button', {
            hasText: /Follower count|size/,
          })
          .click();
      } else {
        console.log('is not visible');
      }
    } catch (e) {
      Logger.error('handlFollowerCount says: ', e.message);
    }
  }

  async handlAvgCommissionRate(item: string, page: Page) {
    try {
      await page.getByRole('button', { name: 'Avg. commission rate' }).click();
      await page.getByRole('option', { name: item }).click();
    } catch (e) {
      Logger.error('handlAvgCommissionRate says: ', e.message);
    }
  }

  async handlContentType(item: string, page: Page) {
    try {
      await page.getByRole('button', { name: 'Content type' }).click();
      await page.getByRole('option', { name: item }).click();
    } catch (e) {
      Logger.error('handlContentTYpe says: ', e.message);
    }
  }

  handlCookies(data: string) {
    try {
      const cookies: {
        name: string;
        value: string;
        domain: string;
        path: string;
        httpOnly: boolean;
        secure: boolean;
      }[] = [];

      const cookies_splited = data.split(';');
      const msToken = [];

      cookies_splited.forEach((cookie: string) => {
        cookie.includes('msToken') &&
          msToken.push(cookie.slice(8, cookie.length));
        cookie.includes('sid_guard_tiktokseller') &&
          cookies.push({
            name: 'sid_guard_tiktokseller',
            value: cookie.slice(
              'sid_guard_tiktokseller='.length,
              cookie.length,
            ),
            domain: '.tiktok.com',
            path: '/',
            httpOnly: true,
            secure: true,
          });
      });
      const msTokens = this.handlMsToken(msToken);
      cookies.push(...msTokens);
      return cookies;
    } catch (e) {
      Logger.error('handlCookies says:', e.message);
    }
  }

  handlMsToken(tokens: string[]) {
    const data = [
      {
        name: 'msToken',
        value: '',
        domain: '.tiktokw.us',
        path: '/',
        httpOnly: false,
        secure: true,
      },
      {
        name: 'msToken',
        value: '',
        domain: 'seller-us-accounts.tiktok.com',
        path: '/',
        httpOnly: false,
        secure: false,
      },
      {
        name: 'msToken',
        value: '',
        domain: 'seller-us.tiktok.com',
        path: '/',
        httpOnly: false,
        secure: false,
      },
      {
        name: 'msToken',
        value: '',
        domain: '.tiktok.com',
        path: '/',
        httpOnly: false,
        secure: true,
      },
    ];
    try {
      tokens.forEach((token, index) => {
        data[index].value = token;
      });
      return data;
    } catch (e) {
      Logger.error('handlMsToken says:', e.message);
    }
  }
}
