using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanPortal.Core.Interfaces;
public interface ILoginUserDetails
{
  public Guid UserID { get; set; }
  public string UserName { get; set; }
  public string Phone { get; set; }
  public string Email { get; set; }

}
