using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Entities;
using BeautyBooking.Helper;

namespace BeautyBooking.MappingProfiles
{
    public class AppointmentProfile : Profile
    {
        public AppointmentProfile() 
        {
            CreateMap<Appointment, AppointmentResponse>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName))
                .ForMember(dest => dest.StaffName, opt => opt.MapFrom(src => src.Staff.User.FullName))
                .ForMember(dest => dest.AppointmentStatus, opt => opt.MapFrom(src => src.AppointmentStatus.ToString()))
                .ForMember(dest => dest.TimeRange, opt => opt.MapFrom(src => TimeHelper.FormatToTimeRange(src.StartTime, src.EndTime)))
                .ForMember(dest => dest.AppointmentServices, opt => opt.MapFrom(src => src.AppointmentServices));
                
            CreateMap<AppointmentService, AppointmentServiceResponse>()
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.Service.Name))
                .ForMember(dest => dest.PriceAtBooking, opt => opt.MapFrom(src => src.PriceAtBooking))
                .ForMember(dest => dest.DurationAtBooking, opt => opt.MapFrom(src => src.DurationAtBooking));

            CreateMap<CreateAppointmentRequest, Appointment>()
                .IgnoreAuditFields()
                .ForMember(dest => dest.AppointmentStatus, opt => opt.MapFrom(src => AppointmentStatus.Pending))
                .ForMember(dest => dest.AppointmentServices, opt => opt.Ignore());
            CreateMap<UpdateAppointmentRequest, Appointment>()
                .IgnoreAuditFields()
                .ForMember(dest => dest.AppointmentServices, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src,dest,srcMember) => srcMember != null ));
        }
    }
}
