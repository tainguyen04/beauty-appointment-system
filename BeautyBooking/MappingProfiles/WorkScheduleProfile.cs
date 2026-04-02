using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;

namespace BeautyBooking.MappingProfiles
{
    public class WorkScheduleProfile: Profile
    {
        public WorkScheduleProfile()
        {
            CreateMap<WorkSchedule, WorkScheduleResponse>()
                .ForMember(dest => dest.StaffName, opt => opt.MapFrom(src => src.Staff.User.FullName));

            CreateMap<CreateWorkScheduleRequest, WorkSchedule>()
                .IgnoreAuditFields();
            CreateMap<UpdateWorkScheduleRequest, WorkSchedule>()
                .IgnoreAuditFields()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
