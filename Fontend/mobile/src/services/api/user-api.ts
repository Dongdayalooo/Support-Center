import { ApisauceInstance, ApiResponse } from "apisauce";
import { Storage, StorageKey } from "../storage/index";

export class UserApi {
  private _apisauce: ApisauceInstance;
  private _storage = new Storage();
  constructor(apisauce: ApisauceInstance) {
    this._apisauce = apisauce;
  }

  async login(payload: any): Promise<any> {
    try {
      const response = await this._apisauce.post(`api/loginWithDeviceId`, payload);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  async signUp(payload: any): Promise<any> {
    try {
      const response = await this._apisauce.post(`/api/auth/register`, payload);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  async sendEmailForgotPass(payload: any): Promise<any> {
    try {
      const response = await this._apisauce.post(`/api/email/sendEmailForgotPass`, payload);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  async changePasswordForgot(payload: any): Promise<any> {
    try {
      const response = await this._apisauce.post(`/api/auth/changePasswordForgot`, payload);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  async getListProvince(): Promise<any> {
    try {
      const response = await this._apisauce.post(`/api/auth/takeListProvince`, {});
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  async editUserProfile(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/auth/editUserProfile`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async changePassword(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/auth/changePassword`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async getListServicePacket(payload: any): Promise<any> {
    const response = await this._apisauce.post(`/api/Product/getListServicePacket`,payload);
    return response.data;
  }

  async searchOptionOfPacketService(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/order/searchOptionOfPacketService`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async TakeMobileAppConfigurationIntro(payload: any): Promise<any> {
    const response = await this._apisauce.post(
      `/api/MobileAppConfiguration/TakeMobileAppConfigurationIntro`,
      payload
    );
    return response.data;
  }
  async TakeMobileAppConfigurationLoginAndRegister(payload: any): Promise<any> {
    const response = await this._apisauce.post(
      `/api/MobileAppConfiguration/TakeMobileAppConfigurationLoginAndRegister`,
      payload
    );
    return response.data;
  }

  async takeMobileAppConfigurationLoginScreen(payload: any): Promise<any> {
    const response = await this._apisauce.post(
      `/api/MobileAppConfiguration/TakeMobileAppConfigurationLoginScreen`,
      payload
    );
    return response.data;
  }


  async TakeMobileAppConfigurationPayment(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/MobileAppConfiguration/TakeMobileAppConfigurationPayment`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async createCustomerOrder(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/order/createCustomerOrder`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async changeStatusCustomerOrder(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/order/changeStatusCustomerOrder`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async getListOrderOfCus(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/order/getListOrderOfCus`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async getMasterDataOrderDetail(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/order/getMasterDataOrderDetail`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async getMasterDataOrderActionDetail(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/order/getMasterDataOrderActionDetail`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async deleteOrderOptionByCus(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `api/order/deleteOrderOptionByCus`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async getDashboardDoanhthu(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/Dashboard/takeRevenueStatisticServicePacketDashboard`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async getDashboardChoThanhToan(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/Dashboard/takeRevenueStatisticWaitPaymentDashboard`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async takeMobileAppConfiguration(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/MobileAppConfiguration/takeMobileAppConfiguration`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async removeDeviceId(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `api/auth/removeDeviceId`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async xoaTaiKhoan(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `api/auth/updateUserToNotActive`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async createDataFireBase(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/FireBase/createDataFireBase`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  // api lấy thông tin admin đánh giá
  async takeRatingStatisticDashboard(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/Dashboard/takeRatingStatisticDashboard`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  // api lấy thông tin dashboard admin phiếu yêu cầu
  async takeStatisticServiceTicketDashboard(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/Dashboard/takeStatisticServiceTicketDashboard`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  // api quảng cáo
  async takeListAdvertisementConfiguration(payload: any): Promise<any> {
    const response = await this._apisauce.post(
      `api/MobileAppConfiguration/takeListAdvertisementConfiguration`,payload);
    return response.data;
  }

  // lấy chi tiết tiết độ hỗ trợ dịch vụ
  async getListNote(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `/api/note/getListNote`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  // đánh giá phiếu yêu cầu
  async ratingOrder(payload: any): Promise<any> {
    const accessToken = await this._storage.getItem(StorageKey.TOKEN);
    const response = await this._apisauce.post(
      `api/order/ratingOrder`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

}
