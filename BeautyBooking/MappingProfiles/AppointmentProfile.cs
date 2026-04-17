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
                .ForMember(dest => dest.AppointmentStatus, opt => opt.MapFrom(src => src.AppointmentStatus))
                .ForMember(dest => dest.AppointmentServices, opt => opt.MapFrom(src => src.AppointmentServices))
                .ForMember(dest => dest.WardName, opt => opt.MapFrom(src => src.Ward != null ? src.Ward.FullName : null));

            CreateMap<AppointmentService, AppointmentServiceResponse>()
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.Service.Name))
                .ForMember(dest => dest.PriceAtBooking, opt => opt.MapFrom(src => src.PriceAtBooking))
                .ForMember(dest => dest.DurationAtBooking, opt => opt.MapFrom(src => src.DurationAtBooking));

            CreateMap<CreateAppointmentRequest, Appointment>()
                .IgnoreAuditFields()
                .ForMember(dest => dest.AppointmentStatus, opt => opt.MapFrom(src => AppointmentStatus.Pending))
                .ForMember(dest => dest.AppointmentServices, opt => opt.Ignore())
                .ForMember(dest => dest.Ward, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Staff, opt => opt.Ignore());
            CreateMap<UpdateAppointmentRequest, Appointment>()
                .IgnoreAuditFields()
                .ForMember(dest => dest.AppointmentServices, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            //Dashboard
            CreateMap<Appointment, DashboardAppointmentResponse>()
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : null))
                .ForMember(dest => dest.StaffName, opt => opt.MapFrom(src => src.Staff != null && src.Staff.User != null ? src.Staff.User.FullName : null))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.AppointmentStatus))
                .ForMember(dest => dest.ServicesName, opt => opt.MapFrom(src => src.AppointmentServices.Select(s => s.Service.Name)));
        }
    }
}
