using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TN.TNM.DataAccess.Databases.Entities;
using TN.TNM.DataAccess.Helper;
using TN.TNM.DataAccess.Interfaces;
using TN.TNM.DataAccess.Messages.Parameters.Asset;
using TN.TNM.DataAccess.Messages.Parameters.FireBase;
using TN.TNM.DataAccess.Messages.Results.Asset;
using TN.TNM.DataAccess.Messages.Results.FireBase;
using TN.TNM.DataAccess.Models.FireBase;

namespace TN.TNM.DataAccess.Databases.DAO
{
    public class FireBaseDAO : BaseDAO, IFireBaseDataAccess
    {
        public FireBaseDAO(TNTN8Context _content)
        {
            this.context = _content;
        }

        public TakeDataFireBaseByUserIdResult TakeDataFireBaseByUserId(TakeDataFireBaseByUserIdParameter parameter)
        {
            try
            {
                var listFireBase = (from f in context.FireBase join u in context.User
                                    on f.UserId equals u.UserId into uJoind from u in uJoind.DefaultIfEmpty()
                                    where (f.UserId == parameter.UserId || f.OtherId == parameter.UserId)
                                    select new FireBaseEntityModel
                                    {
                                        Id = f.Id,
                                        UserId = f.UserId,
                                        UserName = u.UserName,
                                        RoomName = f.RoomName,
                                        OtherId = f.OtherId
                                    }).ToList();

                return new TakeDataFireBaseByUserIdResult
                {
                    ListFireBaseEntityModel = listFireBase,
                    StatusCode = System.Net.HttpStatusCode.OK
                };
            }
            catch (Exception e)
            {
                return new TakeDataFireBaseByUserIdResult
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    Message = e.Message
                };
            }
        }

        public CreateDataFireBaseResult CreateDataFireBase(CreateDataFireBaseParameter parameter)
        {
            try
            {
                if(parameter.Sos == null)
                {
                    parameter.Sos = false;
                }
                var fireBaseExit = context.FireBase.Where(x =>
                                            x.RoomName.Contains(parameter.OtherId.ToString()) && x.RoomName.Contains(parameter.UserId.ToString()) && 
                                            x.Sos == parameter.Sos
                
                ).FirstOrDefault();
                if (fireBaseExit != null)
                {
                    return new CreateDataFireBaseResult
                    {
                        Roomname = fireBaseExit.RoomName,
                        StatusCode = System.Net.HttpStatusCode.OK,
                        Message = "Thành công"
                    };
                }

                if(context.FireBase.Where(x => x.RoomName == parameter.RoomName && x.Sos == parameter.Sos).FirstOrDefault() != null)
                {
                    return new CreateDataFireBaseResult
                    {
                        Roomname = parameter.RoomName,
                        StatusCode = System.Net.HttpStatusCode.OK,
                        Message = "Thành công"
                    };
                }

                var fireBase = new FireBase();
                fireBase.Id = Guid.NewGuid();
                fireBase.CreatedById = parameter.UserId;
                fireBase.CreatedDate = DateTime.Now;
                fireBase.UserId = parameter.UserId;
                fireBase.OtherId = parameter.OtherId;
                fireBase.RoomName = parameter.RoomName;
                fireBase.Sos = parameter.Sos.Value;

                context.FireBase.Add(fireBase);
                context.SaveChanges();

                return new CreateDataFireBaseResult
                {
                    Roomname = fireBase.RoomName,
                    StatusCode = System.Net.HttpStatusCode.OK,
                    Message = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new CreateDataFireBaseResult
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    Message = e.Message
                };
            }
        }
        public ThongBaoDayChatResult ThongBaoDayChat(ThongBaoDayChatParameter parameter)
        {
            try
            {
                var deviceId = context.User.FirstOrDefault(x => x.UserId == parameter.ReceiverId)?.DeviceId;
                //Nếu có thì gửi thông báo đẩy
                if(deviceId != null && deviceId != "")
                {
                    var body = "";
                    var title = parameter.Sos == true ? "Bạn có tin nhắn khẩn cấp mới" : "Bạn có tin nhắn mới";
                    CommonHelper.PushNotificationToDevice(deviceId, title, body, "3", Guid.Empty.ToString(), parameter.Sos);
                }
                return new ThongBaoDayChatResult
                {
                    StatusCode = System.Net.HttpStatusCode.OK,
                    Message = "Thành công"
                };
            }
            catch (Exception e)
            {
                return new ThongBaoDayChatResult
                {
                    StatusCode = System.Net.HttpStatusCode.ExpectationFailed,
                    Message = e.Message
                };
            }
        }
    }
}
