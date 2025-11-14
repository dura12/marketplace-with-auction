import { Dispatch, SetStateAction } from "react";
import { updateAboutContent } from "@/utils/api-mock";
import { toast } from "@/hooks/use-toast";

interface Content {
  hero: any;
  mission: any;
  vision: any;
  values: any[];
  stats: any[];
  history: any;
  team: any;
  locations: any;
  awards: any;
  cta: any;
}

interface HandlerProps {
  content: Content | null;
  setContent: Dispatch<SetStateAction<Content | null>>;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
  editingValue: any;
  setEditingValue: Dispatch<SetStateAction<any>>;
  isNewValue: boolean;
  setIsNewValue: Dispatch<SetStateAction<boolean>>;
  setValueDialogOpen: Dispatch<SetStateAction<boolean>>;
  editingTeamMember: any;
  setEditingTeamMember: Dispatch<SetStateAction<any>>;
  isNewTeamMember: boolean;
  setIsNewTeamMember: Dispatch<SetStateAction<boolean>>;
  setTeamMemberDialogOpen: Dispatch<SetStateAction<boolean>>;
  editingStat: any;
  setEditingStat: Dispatch<SetStateAction<any>>;
  isNewStat: boolean;
  setIsNewStat: Dispatch<SetStateAction<boolean>>;
  setStatDialogOpen: Dispatch<SetStateAction<boolean>>;
  editingTimelineEvent: any;
  setEditingTimelineEvent: Dispatch<SetStateAction<any>>;
  isNewTimelineEvent: boolean;
  setIsNewTimelineEvent: Dispatch<SetStateAction<boolean>>;
  setTimelineDialogOpen: Dispatch<SetStateAction<boolean>>;
}

export const createContentHandlers = ({
  content,
  setContent,
  setIsSaving,
  editingValue,
  setEditingValue,
  isNewValue,
  setIsNewValue,
  setValueDialogOpen,
  editingTeamMember,
  setEditingTeamMember,
  isNewTeamMember,
  setIsNewTeamMember,
  setTeamMemberDialogOpen,
  editingStat,
  setEditingStat,
  isNewStat,
  setIsNewStat,
  setStatDialogOpen,
  editingTimelineEvent,
  setEditingTimelineEvent,
  isNewTimelineEvent,
  setIsNewTimelineEvent,
  setTimelineDialogOpen,
}: HandlerProps) => ({
  handleSaveChanges: async () => {
    if (!content) return;
    setIsSaving(true);
    try {
      await updateAboutContent(content);
      toast({
        title: "Content updated",
        description: "About Us content has been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to save about us content:", error);
      toast({
        title: "Error saving content",
        description: "Failed to save About Us content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  },

  handleAddValue: () => {
    setEditingValue({
      id: `value-${Date.now()}`,
      title: "",
      description: "",
      icon: "Award",
    });
    setIsNewValue(true);
    setValueDialogOpen(true);
  },

  handleEditValue: (value: any) => {
    setEditingValue({ ...value });
    setIsNewValue(false);
    setValueDialogOpen(true);
  },

  handleSaveValue: () => {
    if (!editingValue?.title || !editingValue?.description) return;
    if (isNewValue) {
      setContent({
        ...content!,
        values: [...content!.values, editingValue],
      });
    } else {
      setContent({
        ...content!,
        values: content!.values.map((value: any) =>
          value.id === editingValue.id ? editingValue : value
        ),
      });
    }
    setValueDialogOpen(false);
    toast({
      title: isNewValue ? "Value added" : "Value updated",
      description: isNewValue
        ? `${editingValue.title} has been added to your company values.`
        : `${editingValue.title} has been updated.`,
    });
  },

  handleDeleteValue: (id: string) => {
    setContent({
      ...content!,
      values: content!.values.filter((value: any) => value.id !== id),
    });
    toast({
      title: "Value deleted",
      description: "The value has been removed from your company values.",
    });
  },

  handleAddTeamMember: () => {
    setEditingTeamMember({
      id: `member-${Date.now()}`,
      name: "",
      role: "",
      bio: "",
      image: "/placeholder.svg?height=300&width=300",
    });
    setIsNewTeamMember(true);
    setTeamMemberDialogOpen(true);
  },

  handleEditTeamMember: (member: any) => {
    setEditingTeamMember({ ...member });
    setIsNewTeamMember(false);
    setTeamMemberDialogOpen(true);
  },

  handleSaveTeamMember: () => {
    if (!editingTeamMember?.name || !editingTeamMember?.role) return;
    if (isNewTeamMember) {
      setContent({
        ...content!,
        team: {
          ...content!.team,
          members: [...content!.team.members, editingTeamMember],
        },
      });
    } else {
      setContent({
        ...content!,
        team: {
          ...content!.team,
          members: content!.team.members.map((member: any) =>
            member.id === editingTeamMember.id ? editingTeamMember : member
          ),
        },
      });
    }
    setTeamMemberDialogOpen(false);
    toast({
      title: isNewTeamMember ? "Team member added" : "Team member updated",
      description: isNewTeamMember
        ? `${editingTeamMember.name} has been added to your team.`
        : `${editingTeamMember.name}'s information has been updated.`,
    });
  },

  handleDeleteTeamMember: (id: string) => {
    setContent({
      ...content!,
      team: {
        ...content!.team,
        members: content!.team.members.filter((member: any) => member.id !== id),
      },
    });
    toast({
      title: "Team member deleted",
      description: "The team member has been removed from your team.",
    });
  },

  handleAddStat: () => {
    setEditingStat({
      id: `stat-${Date.now()}`,
      value: "",
      label: "",
    });
    setIsNewStat(true);
    setStatDialogOpen(true);
  },

  handleEditStat: (stat: any) => {
    setEditingStat({ ...stat });
    setIsNewStat(false);
    setStatDialogOpen(true);
  },

  handleSaveStat: () => {
    if (!editingStat?.value || !editingStat?.label) return;
    if (isNewStat) {
      setContent({
        ...content!,
        stats: [...content!.stats, editingStat],
      });
    } else {
      setContent({
        ...content!,
        stats: content!.stats.map((stat: any) =>
          stat.id === editingStat.id ? editingStat : stat
        ),
      });
    }
    setStatDialogOpen(false);
    toast({
      title: isNewStat ? "Stat added" : "Stat updated",
      description: isNewStat
        ? `${editingStat.label} has been added to your stats.`
        : `${editingStat.label} has been updated.`,
    });
  },

  handleDeleteStat: (id: string) => {
    setContent({
      ...content!,
      stats: content!.stats.filter((stat: any) => stat.id !== id),
    });
    toast({
      title: "Stat deleted",
      description: "The stat has been removed from your stats.",
    });
  },

  handleAddTimelineEvent: () => {
    setEditingTimelineEvent({
      id: `event-${Date.now()}`,
      year: "",
      title: "",
      description: "",
      image: "/placeholder.svg?height=100&width=100",
    });
    setIsNewTimelineEvent(true);
    setTimelineDialogOpen(true);
  },

  handleEditTimelineEvent: (event: any) => {
    setEditingTimelineEvent(event);
    setIsNewTimelineEvent(false);
    setTimelineDialogOpen(true);
  },

  handleSaveTimelineEvent: () => {
    if (!editingTimelineEvent?.year || !editingTimelineEvent?.title) return;
    if (isNewTimelineEvent) {
      setContent({
        ...content!,
        history: {
          ...content!.history,
          timeline: [
            ...content!.history.timeline,
            {
              id: editingTimelineEvent.id,
              year: editingTimelineEvent.year,
              title: editingTimelineEvent.title,
              description: editingTimelineEvent.description,
              image: editingTimelineEvent.image,
            },
          ],
        },
      });
    } else {
      setContent({
        ...content!,
        history: {
          ...content!.history,
          timeline: content!.history.timeline.map((event: any) =>
            event.id === editingTimelineEvent.id
              ? {
                  id: event.id,
                  year: editingTimelineEvent.year,
                  title: editingTimelineEvent.title,
                  description: editingTimelineEvent.description,
                  image: editingTimelineEvent.image,
                }
              : event
          ),
        },
      });
    }
    setTimelineDialogOpen(false);
    toast({
      title: isNewTimelineEvent ? "Timeline event added" : "Timeline event updated",
      description: isNewTimelineEvent
        ? `${editingTimelineEvent.title} has been added to your timeline.`
        : `${editingTimelineEvent.title} has been updated.`,
    });
  },

  handleDeleteTimelineEvent: (id: string) => {
    setContent({
      ...content!,
      history: {
        ...content!.history,
        timeline: content!.history.timeline.filter((event: any) => event.id !== id),
      },
    });
    toast({
      title: "Timeline event deleted",
      description: "The event has been removed from your timeline.",
    });
  },
});