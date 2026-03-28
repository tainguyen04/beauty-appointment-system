using AutoMapper;
using BeautyBooking.DTO.Request;
using BeautyBooking.DTO.Response;
using BeautyBooking.Interface.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BeautyBooking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffProfileController : ControllerBase
    {
        private readonly IStaffProfileService _staffProfileService;
        private readonly IMapper _mapper;

        public StaffProfileController(IStaffProfileService staffProfileService, IMapper mapper)
        {
            _staffProfileService = staffProfileService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<List<StaffProfileResponse>>> GetAll()
        {
            var staffProfiles = await _staffProfileService.GetAllAsync();
            if (staffProfiles == null || !staffProfiles.Any())
                return NoContent();
            var response = _mapper.Map<List<StaffProfileResponse>>(staffProfiles);
            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StaffProfileResponse>> GetById(int id)
        {
            var staffProfile = await _staffProfileService.GetByIdAsync(id);
            if (staffProfile == null)
                return NotFound();
            var response = _mapper.Map<StaffProfileResponse>(staffProfile);
            return Ok(response);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<StaffProfileResponse>> GetByUserId(int userId)
        {
            var staffProfile = await _staffProfileService.GetByUserIdAsync(userId);
            if (staffProfile == null)
                return NotFound();
            var response = _mapper.Map<StaffProfileResponse>(staffProfile);
            return Ok(response);
        }

        [HttpPost("upsert")]
        public async Task<ActionResult> UpSert([FromBody] StaffProfileRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var profileId = await _staffProfileService.UpSertAsync(request);

            var fullProfile = await _staffProfileService.GetByIdAsync(profileId);
            var response = _mapper.Map<StaffProfileResponse>(fullProfile);

            return CreatedAtAction(nameof(GetById), new { id = profileId }, response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _staffProfileService.DeleteAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}
