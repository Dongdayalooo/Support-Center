﻿using System;
using System.Collections.Generic;
using System.Text;
using TN.TNM.DataAccess.Models.Note;

namespace TN.TNM.DataAccess.Messages.Results.Note
{
    public class CreateNoteForProjectScopeResult : BaseResult
    {
        public List<NoteEntityModel> ListNote { get; set; }
    }
}
